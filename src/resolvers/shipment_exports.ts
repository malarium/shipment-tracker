import { ForbiddenError, UserInputError } from 'apollo-server'
import { CsvRow } from '../generateCsv'
import LineItem from '../models/line_item'
import Offer from '../models/offer'
import Pallet from '../models/pallet'
import Shipment from '../models/shipment'
import ShipmentExport from '../models/shipment_export'
import UserAccount from '../models/user_account'
import { MutationResolvers, QueryResolvers } from '../server-internal-types'

const include = [UserAccount]

const exportShipment: MutationResolvers['exportShipment'] = async (
  _,
  { shipmentId },
  { auth, services },
) => {
  if (!auth.isAdmin) {
    throw new ForbiddenError('Must be admin')
  }

  const shipment = await Shipment.findByPk(shipmentId, {
    include: {
      association: 'offers',
      include: [
        {
          association: 'pallets',
          include: {
            // @ts-ignore
            association: 'lineItems',
            include: [
              {
                association: 'acceptedReceivingGroup',
              },
              {
                association: 'proposedReceivingGroup',
              },
            ],
          },
        },
        { association: 'sendingGroup' },
      ],
    },
  })

  if (!shipment) {
    throw new UserInputError(`Shipment ${shipmentId} does not exist`)
  }

  const rows = shipment.offers.flatMap((offer) =>
    offer.pallets.flatMap((pallet) =>
      pallet.lineItems.map((lineItem) =>
        makeExportRow(offer, pallet, lineItem),
      ),
    ),
  )

  rows.unshift(HEADER_ROW)

  const csv = services.generateCsv(rows)

  const exportRecord = await ShipmentExport.create({
    contentsCsv: csv,
    shipmentId,
    userAccountId: auth.userId,
  })

  return (
    (await ShipmentExport.findByPk(exportRecord.id, {
      include,
    })) as ShipmentExport
  ).toWireFormat()
}

export const HEADER_ROW = [
  'Sending group',
  'Contact name',
  'Contact email',
  'Contact WhatsApp',
  'Receiving group',
  'UK Hub',
  'Category of aid',
  'Item description',
  'Pallet ID',
  'Container count',
  'Pallet weight (kg)',
  'Dangerous items',
  'Sending hub delivery date',
]

function makeExportRow(
  offer: Offer,
  pallet: Pallet,
  lineItem: LineItem,
): CsvRow {
  const contact = offer.contact || offer.sendingGroup.primaryContact
  const receivingGroupName = lineItem?.acceptedReceivingGroup
    ? `${lineItem.acceptedReceivingGroup.name} (accepted)`
    : lineItem?.proposedReceivingGroup
    ? `${lineItem?.proposedReceivingGroup?.name} (proposed)`
    : 'unset'

  return [
    offer.sendingGroup.name,
    contact?.name,
    contact?.email,
    contact?.whatsApp,
    receivingGroupName,
    'UK Hub -- what is this?',
    lineItem.category,
    lineItem.description,
    lineItem.offerPalletId,
    lineItem.containerCount,
    pallet.weightKilos(),
    lineItem.dangerousGoods.join(', ') || 'None',
    lineItem.sendingHubDeliveryDate?.toISOString()?.split('T')[0],
  ]
}

const listShipmentExports: QueryResolvers['listShipmentExports'] = async (
  _,
  { shipmentId },
  { auth },
) => {
  if (!auth.isAdmin) {
    throw new ForbiddenError('Must be admin')
  }

  return (await ShipmentExport.findAll({ where: { shipmentId }, include })).map(
    (shipmentExport: ShipmentExport) => shipmentExport.toWireFormat(),
  )
}

export { exportShipment, listShipmentExports }
