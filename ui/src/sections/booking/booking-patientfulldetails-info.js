import PropTypes from 'prop-types';
// @mui
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import { Grid } from '@mui/material';
import { format } from 'date-fns';
// components

// ----------------------------------------------------------------------

export default function BookingPatientFullDetailsInfo({ patient, patientDetail }) {
  const renderCustomer = (
    <>
      <CardHeader title="Patient Intake Details" />
      <Grid container sx={{ p: 3 }}>
        <Grid item xs={12}>
          <Divider sx={{ borderStyle: 'dashed', mb: 2 }} />
          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ typography: 'body2',justifyContent: 'center',mb: 2 }}>
            <Typography variant="subtitle2">Personal Information</Typography>
          </Stack>
        </Grid>
        <Grid item xs={6}>
          <Stack direction="row" spacing={0.5} alignItems="flex-start" sx={{ typography: 'body2' }}>
            <Typography variant="subtitle2">Patient Name : </Typography>
            <Typography variant="subtitle2">{patientDetail?.patientName || 'N/A'}</Typography>
          </Stack>
        </Grid>
        <Grid item xs={6}>
          <Stack direction="row" spacing={0.5} alignItems="flex-start" sx={{ typography: 'body2' }}>
            <Typography variant="subtitle2">Email : </Typography>
            <Typography variant="subtitle2">{patientDetail?.email || 'N/A'}</Typography>
          </Stack>
        </Grid>
        <Grid item xs={6}>
          <Stack direction="row" spacing={0.5} alignItems="flex-start">
            <Typography variant="subtitle2">Age :</Typography>
            <Typography variant="subtitle2">{patientDetail?.age || 'N/A'}</Typography>
          </Stack>
        </Grid>
        <Grid item xs={6}>
          <Stack direction="row" spacing={0.5} alignItems="flex-start">
            <Typography variant="subtitle2">Gender :</Typography>
            <Typography variant="subtitle2">{patientDetail?.gender || 'N/A'}</Typography>
          </Stack>
        </Grid>
        <Grid item xs={6}>
          <Stack direction="row" spacing={0.5} alignItems="flex-start">
            <Typography variant="subtitle2">DOB :</Typography>
            <Typography variant="subtitle2">
              {patient?.dob ? format(new Date(patient.dob), 'dd MMM yyyy') : 'N/A'}
            </Typography>
          </Stack>
        </Grid>
        <Grid item xs={6}>
          <Stack direction="row" spacing={0.5} alignItems="flex-start">
            <Typography variant="subtitle2">Residential Address :</Typography>
            <Typography variant="subtitle2">{patient?.residentialAddress || 'N/A'}</Typography>
          </Stack>
        </Grid>
        <Grid item xs={6}>
          <Stack direction="row" spacing={0.5} alignItems="flex-start">
            <Typography variant="subtitle2">Blood Group :</Typography>
            <Typography variant="subtitle2">{patient?.bloodGroup || 'N/A'}</Typography>
          </Stack>
        </Grid>
        <Grid item xs={12}>
          <Divider sx={{ borderStyle: 'dashed', mb: 2 }} />
          <Stack direction="row" spacing={0.5} alignItems="flex-start" sx={{ typography: 'body2',justifyContent: 'center',mb: 2 }}>
            <Typography variant="subtitle2">Medical History(opt)</Typography>
          </Stack>
        </Grid>
        <Grid item xs={6}>
          <Stack direction="row" spacing={0.5} alignItems="flex-start">
            <Typography variant="subtitle2">Chronic Illnesses :</Typography>
            <Typography variant="subtitle2">{patient?.chronicIllnesses || 'N/A'}</Typography>
          </Stack>
        </Grid>
        <Grid item xs={6}>
          <Stack direction="row" spacing={0.5} alignItems="flex-start">
            <Typography variant="subtitle2">Past Surgeries :</Typography>
            <Typography variant="subtitle2">{patient?.pastSurgeries || 'N/A'}</Typography>
          </Stack>
        </Grid>
        <Grid item xs={6}>
          <Stack direction="row" spacing={0.5} alignItems="flex-start">
            <Typography variant="subtitle2">Allergies :</Typography>
            <Typography variant="subtitle2">{patient?.allergies || 'N/A'}</Typography>
          </Stack>
        </Grid>
        <Grid item xs={6}>
          <Stack direction="row" spacing={0.5} alignItems="flex-start">
            <Typography variant="subtitle2">Current Medication :</Typography>
            <Typography variant="subtitle2">{patient?.currentMedication || 'N/A'}</Typography>
          </Stack>
        </Grid>
        <Grid item xs={12}>
          <Divider sx={{ borderStyle: 'dashed', mb: 2 }} />
          <Stack direction="row" spacing={0.5} alignItems="flex-start" sx={{ typography: 'body2',justifyContent: 'center',mb: 2 }}>
            <Typography variant="subtitle2">Current Condition(opt)</Typography>
          </Stack>
        </Grid>
        <Grid item xs={6}>
          <Stack direction="row" spacing={0.5} alignItems="flex-start">
            <Typography variant="subtitle2">Main Symptoms :</Typography>
            <Typography variant="subtitle2">{patient?.mainSymptoms || 'N/A'}</Typography>
          </Stack>
        </Grid>
        <Grid item xs={6}>
          <Stack direction="row" spacing={0.5} alignItems="flex-start">
            <Typography variant="subtitle2">Duration :</Typography>
            <Typography variant="subtitle2">{patient?.duration || 'N/A'}</Typography>
          </Stack>
        </Grid>
        <Grid item xs={6}>
          <Stack direction="row" spacing={0.5} alignItems="flex-start">
            <Typography variant="subtitle2">Pain Level :</Typography>
            <Typography variant="subtitle2">{patient?.painLevel || 'N/A'}</Typography>
          </Stack>
        </Grid>
        <Grid item xs={12}>
          <Divider sx={{ borderStyle: 'dashed', mb: 2 }} />
          <Stack direction="row" spacing={0.5} alignItems="flex-start" sx={{ typography: 'body2',justifyContent: 'center',mb: 2 }}>
            <Typography variant="subtitle2">Insurance Details(opt)</Typography>
          </Stack>
        </Grid>
        <Grid item xs={6}>
          <Stack direction="row" spacing={0.5} alignItems="flex-start">
            <Typography variant="subtitle2">Insurance Provider :</Typography>
            <Typography variant="subtitle2">{patient?.insuranceProvider || 'N/A'}</Typography>
          </Stack>
        </Grid>
        <Grid item xs={6}>
          <Stack direction="row" spacing={0.5} alignItems="flex-start">
            <Typography variant="subtitle2">Policy Number :</Typography>
            <Typography variant="subtitle2">{patient?.policyNumber || 'N/A'}</Typography>
          </Stack>
        </Grid>
        <Grid item xs={6}>
          <Stack direction="row" spacing={0.5} alignItems="flex-start">
            <Typography variant="subtitle2">Validity Date :</Typography>
            <Typography variant="subtitle2">
              {patient?.validityDate ? format(new Date(patient.validityDate), 'dd MMM yyyy') : 'N/A'}
            </Typography>
          </Stack>
        </Grid>
        <Grid item xs={12}>
          <Divider sx={{ borderStyle: 'dashed', mb: 2 }} />
          <Stack direction="row" spacing={0.5} alignItems="flex-start" sx={{ typography: 'body2',justifyContent: 'center',mb: 2 }}>
            <Typography variant="subtitle2">Emergency Contact(opt)</Typography>
          </Stack>
        </Grid>
        <Grid item xs={6}>
          <Stack direction="row" spacing={0.5} alignItems="flex-start">
            <Typography variant="subtitle2">Emergency Name :</Typography>
            <Typography variant="subtitle2">{patient?.emergencyName || 'N/A'}</Typography>
          </Stack>
        </Grid>
        <Grid item xs={6}>
          <Stack direction="row" spacing={0.5} alignItems="flex-start">
            <Typography variant="subtitle2">Emergency PhoneNo :</Typography>
            <Typography variant="subtitle2">{patient?.emergencyPhoneNo || 'N/A'}</Typography>
          </Stack>
        </Grid>
        <Grid item xs={6}>
          <Stack direction="row" spacing={0.5} alignItems="flex-start">
            <Typography variant="subtitle2">Relationship :</Typography>
            <Typography variant="subtitle2">{patient?.relationship || 'N/A'}</Typography>
          </Stack>
        </Grid>
      </Grid>
    </>
  );

  return <Card>{renderCustomer}</Card>;
}

BookingPatientFullDetailsInfo.propTypes = {
  patient: PropTypes.object,
  patientDetail: PropTypes.object,
};
