import cx from 'classnames'
import { FunctionComponent, useMemo } from 'react'
import { Column, useSortBy, useTable } from 'react-table'
import Badge from '../../components/Badge'
import ButtonLink from '../../components/ButtonLink'
import InternalLink from '../../components/InternalLink'
import TableHeader from '../../components/table/TableHeader'
import {
  OffersForShipmentQuery,
  useAllGroupsMinimalQuery,
  useOffersForShipmentQuery,
} from '../../types/api-types'
import { offerCreateRoute, offerViewRoute } from '../../utils/routes'

interface Props {
  shipmentId: number
  allowNewOffers?: boolean
}

const ShipmentOffers: FunctionComponent<Props> = ({
  shipmentId,
  allowNewOffers,
}) => {
  // Get the list of offers for this shipment
  const { data } = useOffersForShipmentQuery({
    variables: { shipmentId },
  })

  // Get the list of groups
  const { data: groups } = useAllGroupsMinimalQuery()

  const offers = useMemo(() => data?.listOffers || [], [data])

  const COLUMNS = useMemo(() => {
    if (!groups?.listGroups || !data?.listOffers) {
      return []
    }

    const columns: Column<OffersForShipmentQuery['listOffers'][0]>[] = [
      {
        Header: 'ID',
        accessor: 'id',
        Cell: ({ value }: any) => (
          <InternalLink
            className="font-semibold"
            to={offerViewRoute(shipmentId, value)}
          >
            Offer {value}
          </InternalLink>
        ),
      },
      {
        Header: 'Sending Group',
        accessor: (row) =>
          groups.listGroups.find((group) => group.id === row.sendingGroupId)
            ?.name,
      },
      {
        Header: 'Status',
        accessor: 'status',
        Cell: ({ value }) => <Badge>{value}</Badge>,
      },
      {
        Header: 'Pallets',
        accessor: (row) => row.pallets.length,
      },
      {
        Header: 'Photos',
        accessor: (row) => (
          <abbr title="Support for photo uploads is not implemented, yet.">
            &mdash;
          </abbr>
        ),
      },
    ]

    return columns
  }, [groups, data, shipmentId])

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({ columns: COLUMNS, data: offers }, useSortBy)

  return (
    <div>
      <div className="p-4 md:p-6 flex items-center justify-between">
        <h2 className="text-lg text-gray-700">Offers</h2>
        {allowNewOffers && (
          <ButtonLink to={offerCreateRoute(shipmentId)}>
            Create offer
          </ButtonLink>
        )}
        {!allowNewOffers && (
          <p className="text-gray-600">
            Offers can only be created on Open shipments
          </p>
        )}
      </div>
      <div className="overflow-x-auto pb-8">
        <table className="w-full whitespace-nowrap" {...getTableProps()}>
          <thead className="border-b border-gray-200">
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <TableHeader
                    canSort={column.canSort}
                    isSorted={column.isSorted}
                    isSortedDesc={column.isSortedDesc}
                    title={column.canSort ? 'Sort rows' : ''}
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                  >
                    {column.render('Header')}
                  </TableHeader>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {rows.map((row) => {
              prepareRow(row)
              return (
                <tr
                  {...row.getRowProps()}
                  className="border-b border-gray-200 px-4"
                >
                  {row.cells.map((cell) => (
                    <td
                      {...cell.getCellProps()}
                      className={cx('p-2 first:pl-6 last:pr-6', {
                        'font-semibold text-navy-700 hover:underline':
                          cell.column.Header === 'Name',
                        'bg-gray-50': cell.column.isSorted,
                      })}
                    >
                      {cell.render('Cell')}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && (
        <div className="flex items-center justify-center py-8 text-gray-500">
          No offers yet
        </div>
      )}
    </div>
  )
}

export default ShipmentOffers
