'use client';

import PropTypes from 'prop-types';
import NextLink from 'next/link';
// @mui
import {
  Card,
  CardHeader,
  Table,
  TableBody,
  TableContainer,
  Divider,
  Stack,
  Tooltip,
  IconButton,
} from '@mui/material';
// utils
import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
import { useTable, emptyRows, TableNoData, TableEmptyRows } from 'src/components/table';
// components
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import TableHeadCustom from 'src/components/table/table-head-custom';
import TablePaginationCustom from 'src/components/table/table-pagination-custom';
import TableSelectedAction from 'src/components/table/table-selected-action';
import { useGetSubscriptions } from 'src/api/subscription';// ✅ your custom row component
import InvoiceTableRow from './invoice-table-row';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'invoiceId', label: 'Invoice Id' },
  { id: 'amount', label: 'Amount'},
  { id: 'pdf', label: 'PDF'},
];

// ----------------------------------------------------------------------

export default function AccountBillingHistory() {
  const { subscriptions: tableData = [] } = useGetSubscriptions() || {};

  const table = useTable();
  const confirm = useBoolean();

  const dataFiltered = tableData;

  const denseHeight = table.dense ? 52 : 72;
  const notFound = !dataFiltered.length;

  const handleDeleteRow = (id) => {
    console.log('Delete row:', id);
  };

  return (
    <Card>
      <CardHeader title="Invoice History" />

      <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
        <TableSelectedAction
          dense={table.dense}
          numSelected={table.selected.length}
          rowCount={tableData.length}
          onSelectAllRows={(checked) =>
            table.onSelectAllRows(
              checked,
              tableData.map((row) => row.id)
            )
          }
          action={
            <Tooltip title="Delete">
              <IconButton color="primary" onClick={confirm.onTrue}>
                <Iconify icon="solar:trash-bin-trash-bold" />
              </IconButton>
            </Tooltip>
          }
        />

        <Scrollbar>
          <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
            <TableHeadCustom
              order={table.order}
              orderBy={table.orderBy}
              headLabel={TABLE_HEAD}
              rowCount={tableData.length}
              numSelected={table.selected.length}
              onSort={table.onSort}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  tableData.map((row) => row.id)
                )
              }
              showCheckbox={false}
            />

            <TableBody>
              {dataFiltered
                .slice(
                  table.page * table.rowsPerPage,
                  table.page * table.rowsPerPage + table.rowsPerPage
                )
                .map((invoice) => (
                  <InvoiceTableRow
                    key={invoice.id}
                    row={invoice}
                    selected={table.selected.includes(invoice.id)}
                    onSelectRow={() => table.onSelectRow(invoice.id)}
                    onDeleteRow={() => handleDeleteRow(invoice.id)}
                  />
                ))}

              <TableEmptyRows
                height={denseHeight}
                emptyRows={emptyRows(
                  table.page,
                  table.rowsPerPage,
                  tableData.length
                )}
              />

              <TableNoData notFound={notFound} />
            </TableBody>
          </Table>
        </Scrollbar>
      </TableContainer>

      <TablePaginationCustom
        count={dataFiltered.length}
        page={table.page}
        rowsPerPage={table.rowsPerPage}
        onPageChange={table.onChangePage}
        onRowsPerPageChange={table.onChangeRowsPerPage}
        dense={table.dense}
        onChangeDense={table.onChangeDense}
      />

      <Divider sx={{ borderStyle: 'dashed', mt: 2 }} />
    </Card>
  );
}


