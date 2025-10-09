/* eslint-disable no-nested-ternary */
import PropTypes from 'prop-types';
// @mui
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
// assets
import { PlanFreeIcon, PlanStarterIcon, PlanPremiumIcon } from 'src/assets/icons';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { useRouter } from 'src/routes/hook';
import { paths } from 'src/routes/paths';

// ----------------------------------------------------------------------

export default function MarketplacePricingCard({ card, sx, ...other }) {
  console.log(card);

  const router = useRouter();
  const { id, name, tier, priceINR, discountedPriceINR, bookingLimit, features } = card;

  const basic = tier === 'basic';
  const starter = tier === 'starter';
  const premium = tier === 'premium';

  const handleSelectPlanClick = (planId) => {
    router.push(paths.dashboard.marketplace.payment(planId));
  };

  const renderIcon = (
    <Stack direction="row" alignItems="center" justifyContent="space-between">
      <Box sx={{ width: 48, height: 48 }}>
        {basic && <PlanFreeIcon />}
        {starter && <PlanStarterIcon />}
        {premium && <PlanPremiumIcon />}
      </Box>

      {starter && <Label color="info">POPULAR</Label>}
    </Stack>
  );

  const renderSubscription = (
    <Stack spacing={1}>
      <Typography variant="h4" sx={{ textTransform: 'capitalize' }}>
        {name}
      </Typography>
    </Stack>
  );

  const renderPrice =
    priceINR === 0 ? (
      <Typography variant="h2">Free</Typography>
    ) : (
      <Stack direction="row" alignItems="baseline" spacing={1}>
        <Typography variant="h4">₹</Typography>

        {discountedPriceINR && discountedPriceINR < priceINR ? (
          <Stack direction="row" spacing={1} alignItems="baseline">
            <Typography
              variant="h3"
              sx={{
                textDecoration: 'line-through',
                color: 'text.disabled',
              }}
            >
              {priceINR}
            </Typography>
            <Typography variant="h2">{discountedPriceINR}</Typography>
          </Stack>
        ) : (
          <Typography variant="h2">{priceINR}</Typography>
        )}

        <Typography
          component="span"
          sx={{
            alignSelf: 'center',
            color: 'text.disabled',
            typography: 'body2',
          }}
        >
          / mo
        </Typography>
      </Stack>
    );

  const renderList = (
    <Stack spacing={2}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Box component="span" sx={{ typography: 'overline' }}>
          Features
        </Box>
        <Link variant="body2" color="inherit" underline="always">
          All
        </Link>
      </Stack>

      {/* Booking limit displayed above the feature list */}
      <Stack spacing={1} direction="row" alignItems="center" sx={{ typography: 'body2' }}>
        <Iconify icon="eva:checkmark-fill" width={16} sx={{ mr: 1 }} />
        Booking Limit {bookingLimit}
      </Stack>

      {/* Render the HTML features safely */}
      <Box sx={{ typography: 'body2' }} dangerouslySetInnerHTML={{ __html: features }} />
    </Stack>
  );

  return (
    <Stack
      spacing={5}
      sx={{
        p: 5,
        borderRadius: 2,
        boxShadow: (t) => ({
          xs: t.customShadows.card,
          md: 'none',
        }),
        ...(starter && {
          borderTopRightRadius: { md: 0 },
          borderBottomRightRadius: { md: 0 },
        }),
        ...((starter || premium) && {
          boxShadow: (t) => ({
            xs: t.customShadows.card,
            md: `-40px 40px 80px 0px ${alpha(
              t.palette.mode === 'light' ? t.palette.grey[500] : t.palette.common.black,
              0.16
            )}`,
          }),
        }),
        ...sx,
      }}
      {...other}
    >
      {renderIcon}

      {renderSubscription}

      {renderPrice}

      <Divider sx={{ borderStyle: 'dashed' }} />

      {renderList}

      <Button
        fullWidth
        size="large"
        variant="contained"
        disabled={card.isDisabled || priceINR === 0}
        color={starter ? 'primary' : 'inherit'}
        onClick={() => {
          if (!card.isDisabled) handleSelectPlanClick(id);
        }}
        sx={{
          ...(card.isDisabled && {
            backgroundColor: 'grey.400',
            color: 'text.disabled',
            cursor: 'not-allowed',
            '&:hover': { backgroundColor: 'grey.400' },
          }),
        }}
      >
        {card.isDisabled ? 'Upgrade not available' : priceINR === 0 ? 'Free' : 'Select Plan'}
      </Button>
    </Stack>
  );
}

MarketplacePricingCard.propTypes = {
  card: PropTypes.object,
  sx: PropTypes.object,
};
