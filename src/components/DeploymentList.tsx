import React, { useEffect, useState } from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import CloudDoneIcon from '@material-ui/icons/CloudDone';
import CloudOffIcon from '@material-ui/icons/CloudOff';
import InfoIcon from '@material-ui/icons/Info';
import DeleteIcon from '@material-ui/icons/Delete';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import { useAccount } from '../utils/AccountContext';
import CircularProgress from '@material-ui/core/CircularProgress';
import Button from '@material-ui/core/Button';
import { PROVIDER_GATEWAY } from '../common/constants';


export const DeploymentList = (props: any) => {
  const account = useAccount();
  const akash = account.akash;

  const [deployments, setDeployments] = useState<any>(null);
  const [showInactive, setShowInactive] = useState(false);
  const [closeBusyDseq, setCloseBusyDseq] = useState(-1);
  const [openDetail, setOpenDetail] = useState(false);
  const [deploymentDetail, setDeploymentDetail] = useState<any>({});
  const [openAccessDetail, setOpenAccessDetail] = useState(false);
  const [busyAccessDseq, setBusyAccessDseq] = useState(-1);
  const [leaseStatusResult, setLeaseStatusResult] = React.useState<any>({});

  const getDeployments = async () => {
    if (!akash) {
      return;
    }

    const response = await akash.query.deployment.list.params({
      owner: account.address
    });
    // Sort by highest to lowest dseq
    console.log(response);
    setDeployments(response.deployments.sort((a, b) => {
      return Number(b.deployment?.deploymentId?.dseq || 0) - Number(a.deployment?.deploymentId?.dseq || 0);
    }));
  };

  const closeDeployment = async (dseq: number) => {
    if (!akash) {
      return;
    }
    const response = await akash.tx.deployment.close.params({
      dseq: dseq
    }).then(getDeployments).then(() => setCloseBusyDseq(-1)).catch((e) => {
      console.log(e);
      setCloseBusyDseq(-1);
    })
    console.log(response);
    props.updateBalance();
    return response;
  };

  useEffect(() => {
    getDeployments();
  }, [account]);

  const useStyles = makeStyles((theme: Theme) =>
    createStyles({
      root: {
        display: "flex",
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center"
      },
      active: {
        backgroundColor: theme.palette.secondary.main
      }
    }),
  );
  const classes = useStyles();

  const getDeploymentAccessDetails = async (dseq: number) => {
    if (!akash) {
      return;
    }
    const marketLeaseList = await akash.query.market.lease.list.params({
      owner: account.address,
      dseq: dseq
    });
    console.log(marketLeaseList);
    const leases = marketLeaseList.leases;
    if (leases.length === 0) {
      return;
    }

    const gseq = leases[0].lease?.leaseId?.gseq || 1;
    const oseq = leases[0].lease?.leaseId?.oseq || 1;
    const provider = leases[0].lease?.leaseId?.provider || '';
    console.log(`DSEQ: ${dseq}, GSEQ: ${gseq}, OSEQ: ${oseq}, Provider: ${provider}`)
    const leaseStatus = await akash.provider.leaseStatus.params({
      dseq: dseq, oseq: oseq, gseq: gseq, provider: provider, proxy: PROVIDER_GATEWAY
    });
    console.log(leaseStatus);
    setLeaseStatusResult(leaseStatus);
    return leaseStatus;
  };

  function generateList() {
    const d = showInactive ? deployments : deployments.filter((obj: any) => obj.deployment.state === 1);
    if (d.length === 0) {
      return <Typography>No items to show.</Typography>
    }
    return d.map((obj: any) => {
      const dseq = Number(obj.deployment.deploymentId.dseq);
      const state = obj.deployment.state;
      const avatar = state === 1 
        ?
        <Avatar className={classes.active}>
          <CloudDoneIcon />
        </Avatar>
        :
        <Avatar>
          <CloudOffIcon />
        </Avatar>;
      const closeIcon = closeBusyDseq === dseq ? <CircularProgress color="secondary" size={25}/> : <DeleteIcon />;
      return (
        <ListItem button key={dseq} onClick={() => { setOpenDetail(true); setDeploymentDetail(obj); }}>
          <ListItemAvatar>
            {avatar}
          </ListItemAvatar>
          <ListItemText
            primary={`DSEQ: ${dseq}`}
          />
          <ListItemSecondaryAction>
            <IconButton edge="end" aria-label="access details" onClick={() => {
              setBusyAccessDseq(dseq);
              getDeploymentAccessDetails(dseq).then(() => {
                setBusyAccessDseq(-1);
                setOpenAccessDetail(true);
              });
            }}>
              {(state === 1 && !(busyAccessDseq === dseq) && <InfoIcon />)}
              {(state === 1 && busyAccessDseq === dseq && <CircularProgress color="secondary" size={25}/>)}
            </IconButton>
            <IconButton edge="end" aria-label="delete" onClick={() => {
              setCloseBusyDseq(dseq);
              closeDeployment(dseq);
            }}>
              {(state === 1 && closeIcon)}
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      );
    });
  }

  return (
    <React.Fragment>
      {deployments == null && <div className={classes.root}><CircularProgress color="secondary" /></div>}
      {
        deployments != null && (
          <div>
            <FormGroup row>
              <FormControlLabel
                control={<Switch color="secondary" checked={showInactive} onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setShowInactive(event.target.checked);
                }} name="showInactive" />}
                label="Show Inactive"
              />
            </FormGroup>
            <List component="nav">
              {generateList()}
            </List>
            <Dialog open={openDetail}>
              <DialogContent>
                <DialogContentText>
                  <div>
                    <pre style={ { fontSize: "0.75rem" } }>
                      {JSON.stringify(deploymentDetail, null, 2)}
                    </pre>
                  </div>
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => { setOpenDetail(false); }} variant="contained" color="secondary">
                  Close
                </Button>
              </DialogActions>
            </Dialog>
            <Dialog open={openAccessDetail}>
              <DialogContent>
                <DialogContentText>
                  <div>
                    <pre style={ { fontSize: "0.75rem" } }>
                      {JSON.stringify(leaseStatusResult, null, 2)}
                    </pre>
                  </div>
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => { setOpenAccessDetail(false); }} variant="contained" color="secondary">
                  Close
                </Button>
              </DialogActions>
            </Dialog>
          </div>
        )
      }
    </React.Fragment>
  );
};