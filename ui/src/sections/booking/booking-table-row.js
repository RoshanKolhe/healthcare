import PropTypes from 'prop-types';
// @mui
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
//
import { format } from 'date-fns';

// ----------------------------------------------------------------------

export default function UserTableRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
  onViewRow,
  handleQuickEditRow,
}) {

  const quickEdit = useBoolean();

  const { purposeOfMeet, status, patientFullDetail, doctorTimeSlot } = row;
  console.log('row data', row);
  console.log('doctorTimeSlot', doctorTimeSlot);

  const confirm = useBoolean();

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{purposeOfMeet}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{patientFullDetail.patientName}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{patientFullDetail.phoneNo}</TableCell>
        {/* <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {doctorTimeSlot?.doctorAvailability?.startDate
            ? new Date(doctorTimeSlot.doctorAvailability.startDate)
                .toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })
                .replace(/-/g, '/')
            : '-'}
        </TableCell> */}
        {/* <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {doctorTimeSlot?.slotStart ? formatTime(doctorTimeSlot.slotStart) : '-'}
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {doctorTimeSlot?.slotEnd ? formatTime(doctorTimeSlot.slotEnd) : '-'}
        </TableCell> */}
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {doctorTimeSlot?.doctorAvailability?.startDate ? (
            <ListItemText
              primary={format(new Date(doctorTimeSlot.doctorAvailability.startDate), 'dd MMM yyyy')}
            />
          ) : (
            '-'
          )}
        </TableCell>
        <TableCell>
          {doctorTimeSlot?.slotStart ? (
            <ListItemText primary={format(new Date(doctorTimeSlot.slotStart), 'p')} />
          ) : (
            '-'
          )}
        </TableCell>
        <TableCell>
          {doctorTimeSlot?.slotEnd ? (
            <ListItemText primary={format(new Date(doctorTimeSlot.slotEnd), 'p')} />
          ) : (
            '-'
          )}
        </TableCell>
        <TableCell>
          <Label
            variant="soft"
            color={
              (status === 0 && 'warning') ||
              (status === 1 && 'success') || 
              (status === 2 && 'error') || 
              'default'
            }
          >
            {status === 0 && 'Confirmed'}
            {status === 1 && 'Completed'}
            {status === 2 && 'Cancelled'}
          </Label>
        </TableCell>

        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          <Tooltip title="Referal Form" placement="top" arrow>
            <IconButton
              color={quickEdit.value ? 'inherit' : 'default'}
              onClick={() => {
                handleQuickEditRow(row);
              }}
            >
              <Iconify icon="solar:pen-bold" />
            </IconButton>
          </Tooltip>
          <Tooltip title="View" placement="top" arrow>
            <IconButton
              onClick={() => {
                onViewRow();
              }}
            >
              <Iconify icon="solar:eye-bold" />
            </IconButton>
          </Tooltip>
        </TableCell>
      </TableRow>

      {/* <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >
        <MenuItem
          onClick={() => {
            confirm.onTrue();
            popover.onClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          Delete
        </MenuItem>

        <MenuItem
          onClick={() => {
            onEditRow();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:pen-bold" />
          Edit
        </MenuItem>
      </CustomPopover> */}

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content="Are you sure want to delete?"
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
            Delete
          </Button>
        }
      />
    </>
  );
}

UserTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  onViewRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
  handleQuickEditRow: PropTypes.func,
};
