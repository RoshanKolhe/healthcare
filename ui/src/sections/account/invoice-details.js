'use client';

import PropTypes from 'prop-types';
import { useState, useCallback } from 'react';
// @mui
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
// utils
import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';
// components
import Label from 'src/components/label';
import Scrollbar from 'src/components/scrollbar';
//

// ----------------------------------------------------------------------

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '& td': {
    textAlign: 'right',
    borderBottom: 'none',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
}));

// ----------------------------------------------------------------------

export default function InvoiceubscriptionsDetails({ invoice }) {
  const [currentStatus, setCurrentStatus] = useState(invoice.status);

  const handleChangeStatus = useCallback((event) => {
    setCurrentStatus(event.target.value);
  }, []);

  const renderTotal = (
    <>
      <StyledTableRow>
        <TableCell colSpan={2} />
        <TableCell sx={{ color: 'text.secondary' }}>Discount</TableCell>
        <TableCell width={120} sx={{ color: 'error.main', typography: 'body2' }}>
          -{(`${invoice.plan.priceINR - invoice.plan.discountedPriceINR}`)}
        </TableCell>
      </StyledTableRow>

      <StyledTableRow>
        <TableCell colSpan={2} />
        <TableCell sx={{ color: 'text.secondary' }}>Amount after discount</TableCell>
        <TableCell width={140}>{(invoice.amount)}</TableCell>
      </StyledTableRow>

      <StyledTableRow>
        <TableCell colSpan={2} />
        <TableCell sx={{ color: 'text.secondary' }}>Taxe Amount</TableCell>
        <TableCell width={120}>{(invoice.taxAmount)}</TableCell>
      </StyledTableRow>

      <StyledTableRow>
        <TableCell colSpan={2} />
        <TableCell sx={{ typography: 'subtitle1' }}>Total</TableCell>
        <TableCell width={140} sx={{ typography: 'subtitle1' }}>
          {(invoice?.totalAmount)}
        </TableCell>
      </StyledTableRow>
    </>
  );

  const renderFooter = (
    <Grid container>
      <Grid xs={12} md={9} sx={{ py: 3 }}>
        <Typography variant="subtitle2">NOTES</Typography>

        <Typography variant="body2">
          We appreciate your business. Should you need us to add VAT or extra notes let us know!
        </Typography>
      </Grid>

      <Grid xs={12} md={3} sx={{ py: 3, textAlign: 'right' }}>
        <Typography variant="subtitle2">Have a Question?</Typography>

        <Typography variant="body2">support@healthcare.cc</Typography>
      </Grid>
    </Grid>
  );

  console.log(invoice);

  const renderList = (
    <TableContainer sx={{ overflow: 'unset', mt: 5 }}>
      <Scrollbar>
        <Table sx={{ minWidth: 960 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ typography: 'subtitle2' }}>Description</TableCell>

              <TableCell>Qty</TableCell>

              <TableCell align="right">Unit price</TableCell>

              <TableCell align="right">Total</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            <TableRow>
              <TableCell>
                <Box sx={{ maxWidth: 560 }}>
                  <Typography variant="subtitle2">{invoice?.plan?.name}</Typography>
                </Box>
              </TableCell>

              <TableCell>1</TableCell>

              <TableCell align="right">{(invoice.plan.priceINR)}</TableCell>

              <TableCell align="right">{(invoice.plan.priceINR)}</TableCell>
            </TableRow>

            {renderTotal}
          </TableBody>
        </Table>
      </Scrollbar>
    </TableContainer>
  );

  return (
    <Card sx={{ pt: 5, px: 5 }}>
      <Box
        rowGap={5}
        display="grid"
        alignItems="center"
        gridTemplateColumns={{
          xs: 'repeat(1, 1fr)',
          sm: 'repeat(2, 1fr)',
        }}
      >
        <Box
          component="img"
          alt="logo"
          src="/logo/logo_single.svg"
          sx={{ width: 48, height: 48 }}
        />

        <Stack spacing={1} alignItems={{ xs: 'flex-start', md: 'flex-end' }}>

          <Typography variant="h6">{invoice.invoiceId}</Typography>
        </Stack>

        <Stack sx={{ typography: 'body2' }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Invoice From
          </Typography>
          Healthcare
          <br />
          Healthcare address
          <br />
          Phone: 912345678904
          <br />
        </Stack>

        <Stack sx={{ typography: 'body2' }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Invoice To
          </Typography>
          {invoice.purchasedByUser.firstName} {invoice.purchasedByUser.lastName}
          <br />
          {invoice.purchasedByUser.fullAddress}
          <br />
          Phone: {invoice.purchasedByUser.phoneNumber}
          <br />
        </Stack>

        <Stack sx={{ typography: 'body2' }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Invoice Date
          </Typography>
          {fDate(invoice.createdAt)}
        </Stack>

        {/* <Stack sx={{ typography: 'body2' }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Expiry Date
          </Typography>
          {fDate(invoice.expiryDate)}
        </Stack> */}
      </Box>

      {renderList}

      <Divider sx={{ mt: 5, borderStyle: 'dashed' }} />

      {renderFooter}
    </Card>
  );
}

InvoiceubscriptionsDetails.propTypes = {
  invoice: PropTypes.object,
};
