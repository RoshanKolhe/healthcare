import PropTypes from 'prop-types';
// @mui
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import ListItemText from '@mui/material/ListItemText';
import Link from '@mui/material/Link';
import NextLink from 'next/link';
import { fDate } from 'src/utils/format-time';

// ----------------------------------------------------------------------

export default function InvoiceTableRow({
  row,
  selected,
}) {
  const { totalAmount, createdAt, invoiceId } = row;

  return (
      <TableRow hover selected={selected}>

        <TableCell sx={{ display: 'flex', alignItems: 'center' }}>

          <ListItemText
            primary={invoiceId}
            secondary={fDate(createdAt)}
            primaryTypographyProps={{ typography: 'body2' }}
            secondaryTypographyProps={{ component: 'span', color: 'text.disabled' }}
          />
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{totalAmount}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          <Link
            component={NextLink}
            href={`/dashboard/clinic-invoice/${invoiceId}`}
            color="inherit"
            underline="always"
            variant="body2"
          >
            PDF
          </Link>
        </TableCell>
      </TableRow>
  );
}

InvoiceTableRow.propTypes = {
  row: PropTypes.object,
  selected: PropTypes.bool,
};
