import { Type } from '@sinclair/typebox'
import { ApolloError, UserInputError } from 'apollo-server'
import { validateIdInput } from '../input-validation/idInputSchema'
import { ID } from '../input-validation/types'
import { validateWithJSONSchema } from '../input-validation/validateWithJSONSchema'
import LineItem from '../models/line_item'
import Offer from '../models/offer'
import Pallet, { PalletAttributes } from '../models/pallet'
import {
  MutationResolvers,
  PalletResolvers,
  PalletType,
  PaymentStatus,
  QueryResolvers,
} from '../server-internal-types'
import getPalletWithParentAssociations from './getPalletWithParentAssociations'
import {
  authorizeOfferMutation,
  authorizeOfferQuery,
} from './offer_authorization'

// Pallet mutation resolvers

// - add pallet

const addPalletInput = Type.Object(
  {
    offerId: ID,
    palletType: Type.Optional(Type.Enum(PalletType)),
  },
  { additionalProperties: false },
)

const validateAddPalletInput = validateWithJSONSchema(addPalletInput)

const addPallet: MutationResolvers['addPallet'] = async (
  _,
  { input },
  context,
) => {
  const valid = validateAddPalletInput(input)
  if ('errors' in valid) {
    throw new UserInputError('Add pallet arguments invalid', valid.errors)
  }

  const offer = await Offer.findByPk(valid.value.offerId, {
    include: [{ association: 'sendingGroup' }, { association: 'shipment' }],
  })
  if (offer === null) {
    throw new UserInputError(`Offer ${valid.value.offerId} does not exist`)
  }

  authorizeOfferMutation(offer, context)

  return Pallet.create({
    ...input,
    paymentStatus: PaymentStatus.Uninitiated,
    paymentStatusChangeTime: new Date(),
  })
}

// - update pallet

const updatePalletInput = Type.Object(
  {
    id: ID,
    input: Type.Object(
      {
        paymentStatus: Type.Optional(Type.Enum(PaymentStatus)),
        palletType: Type.Optional(Type.Enum(PalletType)),
      },
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false },
)

const validateUpdatePalletInput = validateWithJSONSchema(updatePalletInput)

const updatePallet: MutationResolvers['updatePallet'] = async (
  _,
  input,
  context,
) => {
  const valid = validateUpdatePalletInput(input)
  if ('errors' in valid) {
    throw new UserInputError('Add pallet arguments invalid', valid.errors)
  }

  const pallet = await getPalletWithParentAssociations(valid.value.id)

  if (!pallet) {
    throw new UserInputError(`Pallet ${valid.value.id} does not exist`)
  }

  const offer = pallet.offer

  if (!offer) {
    throw new ApolloError(`Pallet ${pallet.offerId} has no offer!`)
  }

  authorizeOfferMutation(offer, context)

  const updateAttributes: Partial<PalletAttributes> = {}

  if (valid.value.input.paymentStatus !== undefined) {
    updateAttributes.paymentStatus = valid.value.input.paymentStatus
    updateAttributes.paymentStatusChangeTime = new Date()
  }

  if (valid.value.input.palletType !== undefined) {
    updateAttributes.palletType = valid.value.input.palletType
  }

  return pallet.update(updateAttributes)
}

// - get pallet

const pallet: QueryResolvers['pallet'] = async (_, { id }, context) => {
  const valid = validateIdInput({ id })
  if ('errors' in valid) {
    throw new UserInputError('Get pallet input invalid', valid.errors)
  }

  const pallet = await getPalletWithParentAssociations(valid.value.id)

  if (pallet === null) {
    throw new UserInputError(`Pallet ${valid.value.id} does not exist`)
  }

  const offer = pallet.offer

  if (offer === null) {
    throw new ApolloError(`Pallet ${pallet.offerId} has no offer!`)
  }

  authorizeOfferQuery(offer, context)

  return pallet
}

// - destroy pallet

const destroyPallet: MutationResolvers['destroyPallet'] = async (
  _,
  { id },
  context,
) => {
  const valid = validateIdInput({ id })
  if ('errors' in valid) {
    throw new UserInputError('Destroy pallet input invalid', valid.errors)
  }

  const pallet = await getPalletWithParentAssociations(valid.value.id)

  if (pallet === null) {
    throw new UserInputError(`Pallet ${valid.value.id} does not exist`)
  }

  const offer = pallet.offer

  if (offer === null) {
    throw new ApolloError(`Pallet ${pallet.offerId} has no offer!`)
  }

  authorizeOfferMutation(offer, context)

  await pallet.destroy()
  return offer
}

// - list line items

const palletLineItems: PalletResolvers['lineItems'] = async (parent) => {
  return LineItem.findAll({ where: { offerPalletId: parent.id } })
}

export { addPallet, updatePallet, destroyPallet, palletLineItems, pallet }
