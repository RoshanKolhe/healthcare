import PropTypes from 'prop-types';
// @mui
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { ConfirmDialog } from 'src/components/custom-dialog';
//
import { Stack, Typography } from '@mui/material';
import BranchQuickEditForm from './branch-quick-edit-form';

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
  const { name, fullAddress, city, state, isActive, hospitalName } = row;
  console.log('row data', row);

  const confirm = useBoolean();

  const quickEdit = useBoolean();

  const popover = usePopover();

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell>
        {/* <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar alt={imageUpload} src={imageUpload} sx={{ mr: 2 }} />

          <ListItemText
            primary={branchName}
            // secondary={email}
            primaryTypographyProps={{ typography: 'body2' }}
            // secondaryTypographyProps={{ component: 'span', color: 'text.disabled' }}
          />
        </TableCell> */}
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{name}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{fullAddress}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{state}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{city}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{hospitalName}</TableCell>

        <TableCell>
          <Label
            variant="soft"
            color={(isActive && 'success') || (isActive && 'error') || 'default'}
          >
            {isActive ? 'Active' : 'In-Active'}
          </Label>
        </TableCell>

        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          <Tooltip title="Edit" placement="top" arrow>
            <IconButton
              color={quickEdit.value ? 'inherit' : 'default'}
              onClick={() => {
                onEditRow();
                popover.onClose();
              }}
            >
              <Iconify icon="solar:pen-bold" />
            </IconButton>
          </Tooltip>
          <Tooltip title="View User" placement="top" arrow>
            <IconButton
              onClick={() => {
                onViewRow();
              }}
            >
              <Iconify icon="solar:eye-bold" />
            </IconButton>
          </Tooltip>
          {/* <Tooltip title="Edit Branch" placement="top" arrow>
            <MenuItem
              onClick={() => {
                onEditRow();
                popover.onClose();
              }}
            >
              <Iconify icon="solar:pen-bold" />
              Edit
            </MenuItem>
          </Tooltip> */}

          {/* <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton> */}
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
