import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import VerifiedUserIcon from '@material-ui/icons/VerifiedUser';

const useStyles = makeStyles({
  root: {
    width: 500,
    display: "flex",
    flexGrow: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center"
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginTop: 10,
    marginBottom: 12,
  }
});

export const CertificateCard = (props: any) => {
  const classes = useStyles();

  return (
    <Card className={classes.root}>
      <CardContent className={classes.root}>
        <Typography variant="h5" color="textSecondary">
          Valid Certificate <VerifiedUserIcon color="secondary"/>
        </Typography>
        <Typography className={classes.pos} color="textSecondary">
          {`Serial Number: ${props.serialNumber}`}
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="large" color="secondary">Revoke</Button>
      </CardActions>
    </Card>
  );
};