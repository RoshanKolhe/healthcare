/* eslint-disable no-useless-escape */
/* eslint-disable no-nested-ternary */
import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
// components
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFEditor, RHFTextField, RHFUploadAvatar } from 'src/components/hook-form';
import { useResponsive } from 'src/hooks/use-responsive';
import axiosInstance from 'src/utils/axios';
import { fData } from 'src/utils/format-number';
import { features } from 'process';

// ----------------------------------------------------------------------

export default function AgentViewForm({ currentAgent }) {
  const router = useRouter();

  const mdUp = useResponsive('up', 'md');

  const { enqueueSnackbar } = useSnackbar();

  const NewAgentSchema = Yup.object().shape({
    name: Yup.string().required('Agent Name is required'),
    description: Yup.string(),
    features: Yup.string().required('Features is required'),
    thumbnail: Yup.mixed().required('Thumbnail is required'),
    isActive: Yup.boolean(),
  });

  const defaultValues = useMemo(
    () => ({
      name: currentAgent?.name || '',
      description: currentAgent?.description || '',
      features: currentAgent?.features || '',
      thumbnail: currentAgent?.thumbnail?.fileUrl || '',
      isActive: currentAgent ? (currentAgent?.isActive ? '1' : '0') : '1',
    }),
    [currentAgent]
  );

  const methods = useForm({
    resolver: yupResolver(NewAgentSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const handleRemoveFile = useCallback(() => {
    setValue('thumbnail', null);
  }, [setValue]);

  const handleDrop = useCallback(
    async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        const formData = new FormData();
        formData.append('thumbnail', file);
        const response = await axiosInstance.post('/files', formData);
        const { data } = response;
        const fileUrl = data?.files?.[0]?.fileUrl;
        setValue('thumbnail', fileUrl, {
          shouldValidate: true,
        });
      }
    },
    [setValue]
  );

  useEffect(() => {
    if (currentAgent) {
      reset(defaultValues);
    }
  }, [currentAgent, defaultValues, reset]);

  const renderDetails = (
    <Grid xs={12} md={8}>
      <Card sx={{ pb: 2 }}>
        <Stack spacing={3} sx={{ p: 3 }}>
          <Grid container spacing={2} xs={12} md={12}>
            <Grid xs={12} md={12}>
              <RHFTextField name="name" label="Agent Name" disabled />
            </Grid>
            <Grid xs={12} md={12}>
              <RHFTextField name="description" label="Description" disabled />
            </Grid>
            <Grid xs={12} md={12}>
              <Stack spacing={1.5}>
                <Typography variant="subtitle2">Features</Typography>
                <RHFEditor simple name="features" disabled />
              </Stack>
            </Grid>
          </Grid>
        </Stack>
      </Card>
    </Grid>
  );

  return (
    <FormProvider methods={methods}>
      <Grid container spacing={3}>
        <Grid xs={12} md={4}>
          <Card sx={{ pt: 10, pb: 5, px: 3 }}>
            <Box sx={{ mb: 5 }}>
              <RHFUploadAvatar
                name="thumbnail"
                maxSize={3145728}
                onDrop={handleDrop}
                onDelete={handleRemoveFile}
                helperText={
                  <Typography
                    variant="caption"
                    sx={{
                      mt: 3,
                      mx: 'auto',
                      display: 'block',
                      textAlign: 'center',
                      color: 'text.disabled',
                    }}
                  >
                    Allowed *.jpeg, *.jpg, *.png, *.gif
                    <br /> max size of {fData(3145728)}
                  </Typography>
                }
                disabled
              />
            </Box>
          </Card>
        </Grid>

        {renderDetails}
      </Grid>
    </FormProvider>
  );
}

AgentViewForm.propTypes = {
  currentAgent: PropTypes.object,
};
