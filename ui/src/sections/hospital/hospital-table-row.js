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
import HospitalQuickEditForm from './hospital-quick-edit-form';

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
  const {
    hospitalName,
    hospitalRegNum,
    hospitalCategory,
    hospitalType,
    hospitalServices,
    description,
    imageUpload,
    address,
    city,
    state,
    country,
    postalCode,
    isActive,
  } = row;
  console.log('row data', row);

  const confirm = useBoolean();

  const quickEdit = useBoolean();

  const popover = usePopover();
  console.log('image', imageUpload);

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell>
        {/* <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar alt={imageUpload} src={imageUpload} sx={{ mr: 2 }} />

          <ListItemText
            primary={hospitalName}
            // secondary={email}
            primaryTypographyProps={{ typography: 'body2' }}
            // secondaryTypographyProps={{ component: 'span', color: 'text.disabled' }}
          />
        </TableCell> */}

        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Avatar src={imageUpload?.fileUrl} alt={hospitalName} />
            <Typography variant="body2" noWrap>
              {hospitalName}
            </Typography>
          </Stack>
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{hospitalRegNum}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{hospitalCategory}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{hospitalType}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{hospitalServices}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{description}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{address}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{city}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{state}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{country}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{postalCode}</TableCell>
        <TableCell>
          <Label
            variant="soft"
            color={(isActive && 'success') || (isActive && 'error') || 'default'}
          >
            {isActive ? 'Active' : 'In-Active'}
          </Label>
        </TableCell>

        {/* <TableCell>
          <Label
            variant="soft"
            color={
              (status === 'active' && 'success') ||
              (status === 'pending' && 'warning') ||
              (status === 'banned' && 'error') ||
              'default'
            }
          >
            {status}
          </Label>
        </TableCell> */}

        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          <Tooltip title="Quick Edit" placement="top" arrow>
            <IconButton
              color={quickEdit.value ? 'inherit' : 'default'}
              onClick={() => {
                handleQuickEditRow(row);
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

          <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>
      
      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >
        {/* <MenuItem
          onClick={() => {
            confirm.onTrue();
            popover.onClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          Delete
        </MenuItem> */}

        <MenuItem
          onClick={() => {
            onEditRow();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:pen-bold" />
          Edit
        </MenuItem>
      </CustomPopover>

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
