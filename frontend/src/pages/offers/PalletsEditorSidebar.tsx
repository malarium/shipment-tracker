import cx from 'classnames'
import { FunctionComponent } from 'react'
import Button from '../../components/Button'
import ChevronIcon from '../../components/icons/ChevronIcon'
import WarningIcon from '../../components/icons/WarningIcon'
import { OfferQuery, PalletQuery } from '../../types/api-types'
import { validatePalletContents } from '../../utils/data'

type Props = {
  pallets: OfferQuery['offer']['pallets'] | undefined
  selectedPalletId?: number
  selectedLineItemId?: number
  isLoading?: boolean
  selectedPalletData?: PalletQuery
  createPallet: () => void
  selectPallet: (palletId: number) => void
  addLineItem: (palletId: number) => void
  selectLineItemId: (lineItemId: number) => void
}

const PalletsEditorSidebar: FunctionComponent<Props> = ({
  isLoading,
  createPallet,
  pallets,
  selectPallet,
  selectedPalletId,
  selectedLineItemId,
  addLineItem,
  selectLineItemId,
  selectedPalletData,
}) => {
  return (
    <div className="w-80 flex-shrink-0 h-full">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <span className="text-lg text-gray-700">Pallets</span>
        <Button disabled={isLoading} onClick={createPallet}>
          Add a pallet
        </Button>
      </div>
      {pallets && (
        <ul className="divide-y divide-gray-100">
          {pallets.map((pallet, index) => (
            <li
              key={pallet.id}
              className="bg-white"
              data-qa={`pallet-${pallet.id}`}
              onClick={() => selectPallet(pallet.id)}
            >
              <div className="bg-white">
                <div
                  className={cx(
                    'p-4 flex items-center text-gray-800 cursor-pointer border-l-4 border-transparent',
                    {
                      'hover:bg-gray-100':
                        pallet.id !== selectedPalletId ||
                        selectedLineItemId != null,
                      'border-navy-600 font-semibold':
                        pallet.id === selectedPalletId,
                      'bg-navy-100':
                        pallet.id === selectedPalletId &&
                        selectedLineItemId == null,
                    },
                  )}
                >
                  <ChevronIcon
                    className="w-5 h-5 mr-4 text-gray-500"
                    direction={
                      pallet.id === selectedPalletId ? 'down' : 'right'
                    }
                  />
                  Pallet {index + 1}
                  {validatePalletContents(pallet.lineItems).valid === false && (
                    <span
                      className="inline-block ml-auto"
                      title="The contents of this pallet are invalid"
                    >
                      <WarningIcon className="text-red-700 w-5 h-5" />
                    </span>
                  )}
                </div>
                {selectedPalletId === pallet.id && (
                  <div className="flex flex-col pb-4 pr-4 pl-8">
                    {selectedPalletData?.pallet.lineItems.map((item) => (
                      <button
                        type="button"
                        className={cx(
                          'px-4 py-2 text-left border-l-4 border-transparent',
                          {
                            'hover:bg-gray-100': item.id !== selectedLineItemId,
                            'border-navy-500 bg-navy-100 text-navy-700':
                              item.id === selectedLineItemId,
                          },
                        )}
                        key={item.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          selectLineItemId(item.id)
                        }}
                      >
                        {item.description || `Item ${item.id}`}
                      </button>
                    ))}
                    <Button
                      type="button"
                      className="mt-4"
                      onClick={() => addLineItem(pallet.id)}
                    >
                      Add items
                    </Button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default PalletsEditorSidebar
