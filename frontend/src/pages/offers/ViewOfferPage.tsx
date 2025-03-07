import { FunctionComponent } from 'react'
import { useParams } from 'react-router-dom'
import ReadOnlyField from '../../components/forms/ReadOnlyField'
import InternalLink from '../../components/InternalLink'
import LayoutWithNav from '../../layouts/LayoutWithNav'
import {
  OfferDocument,
  OfferQuery,
  OfferStatus,
  OfferUpdateInput,
  useGroupQuery,
  useOfferQuery,
  useShipmentQuery,
  useUpdateOfferMutation,
} from '../../types/api-types'
import { setEmptyFieldsToUndefined } from '../../utils/data'
import { formatListOfHubs, formatShipmentName } from '../../utils/format'
import { shipmentViewOffersRoute } from '../../utils/routes'
import { stripIdAndTypename } from '../../utils/types'
import OfferStatusSwitcher from './OfferStatusSwitcher'
import PalletsEditor from './PalletsEditor'

const ViewOfferPage: FunctionComponent = () => {
  const params = useParams<{ shipmentId: string; offerId: string }>()
  const offerId = parseInt(params.offerId ?? '-1', 10)
  const shipmentId = parseInt(params.shipmentId ?? '-1', 10)

  const { data: shipment } = useShipmentQuery({
    variables: { id: shipmentId },
  })

  const { data: offer } = useOfferQuery({ variables: { id: offerId } })

  const sendingGroupId = offer?.offer.sendingGroupId
  const { data: sendingGroup } = useGroupQuery({
    skip: !sendingGroupId, // Don't execute this query until the group ID is known
    variables: { id: sendingGroupId! },
  })

  const [updateOffer] = useUpdateOfferMutation()

  const updateOfferStatus = (newStatus: OfferStatus) => {
    if (!offer) {
      return
    }

    const updatedOffer: OfferUpdateInput = {
      id: offer.offer.id,
      status: newStatus,
      contact: stripIdAndTypename(
        setEmptyFieldsToUndefined(offer.offer.contact),
      ),
      photoUris: offer.offer.photoUris,
    }

    updateOffer({
      variables: { input: updatedOffer },
      update: (cache) => {
        try {
          cache.writeQuery<OfferQuery>({
            query: OfferDocument,
            variables: { id: offerId },
            data: {
              offer: Object.assign({}, offer.offer, { status: newStatus }),
            },
          })
        } catch (error) {
          console.error(error)
        }
      },
    })
  }

  return (
    <LayoutWithNav>
      <div className="max-w-5xl mx-auto border-l border-r border-gray-200 min-h-content bg-white flex flex-col">
        <header className="p-6 border-b border-gray-200 md:flex justify-between">
          <div>
            <InternalLink
              className="inline-block mb-2"
              to={shipmentViewOffersRoute(shipmentId)}
            >
              ← back to shipment
            </InternalLink>
            <h1 className="text-navy-800 text-3xl">Offer details</h1>
          </div>
          {offer?.offer && (
            <div className="flex space-x-8 mt-4 md:mt-0">
              <ReadOnlyField label="Shipment">
                {shipment?.shipment && (
                  <>
                    <p className="text-gray-800">
                      {formatShipmentName(shipment.shipment)}
                    </p>
                    <p className="text-gray-600 text-sm">
                      {formatListOfHubs(shipment.shipment.sendingHubs)} →{' '}
                      {formatListOfHubs(shipment.shipment.receivingHubs)}
                    </p>
                  </>
                )}
              </ReadOnlyField>
              <ReadOnlyField label="Group">
                <p className="text-gray-800">{sendingGroup?.group.name}</p>
                <p className="text-gray-600 text-sm">
                  {sendingGroup?.group.primaryLocation.townCity}
                </p>
              </ReadOnlyField>
              <div>
                <OfferStatusSwitcher
                  currentOfferStatus={offer.offer.status}
                  updateStatus={updateOfferStatus}
                />
              </div>
            </div>
          )}
        </header>
        <main className="flex-grow flex items-stretch">
          {offer?.offer && (
            <PalletsEditor offer={offer.offer} pallets={offer?.offer.pallets} />
          )}
        </main>
      </div>
    </LayoutWithNav>
  )
}

export default ViewOfferPage
