import React, { useEffect } from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';

import gray from '@material-ui/core/colors/grey';
import { useAccount } from '../utils/AccountContext';
import Box from '@material-ui/core/Box';

import { findDeploymentSequence } from 'akashjs';
import BidsForm from './BidsForm';
import { PROVIDER_GATEWAY } from '../common/constants';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
    },
    button: {
      marginTop: theme.spacing(1),
      marginRight: theme.spacing(1),
    },
    actionsContainer: {
      marginBottom: theme.spacing(2),
    },
    resetContainer: {
      padding: theme.spacing(3),
    },
    icon:{
      color: gray[200],
      "&$activeIcon": {
        color: gray[400]
      },
      "&$completedIcon": {
        color: theme.palette.secondary.main
      }
    },
    activeIcon: {},
    completedIcon: {}
  }),
);

function wait(s: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, s * 1000);
  });
};

function getSteps() {
  return [
    'Create a Deployment',
    'Choose your Provider',
    'Create a Lease'
  ];
}

export default function DeployStepper(props: any) {
  const classes = useStyles();
  const [activeStep, setActiveStep] = React.useState(0);

  // const [isCreateDeploymentStep, setIsCreateDeploymentStep] = React.useState(true);
  // const [isChooseProviderStep, setIsChooseProviderStep] = React.useState(false);
  // const [isCreateLeaseStep, setIsCreateLeaseStep] = React.useState(false);
  const [createDeploymentResult, setCreateDeploymentResult] = React.useState<any>({});
  const [bidsList, setBidsList] = React.useState([]);
  const [winProvider, setWinProvider] = React.useState('');
  const [leaseStatusResult, setLeaseStatusResult] = React.useState<any>({});

  const steps = getSteps();

  const account = useAccount();
  const akash = account.akash;

  const handleSetDismissable = props.handleSetDismissable;

  const createDeployment = async () => {
    if (!akash) {
      return;
    }
    console.log("Create a Deployment (tx deployment create)");
    const sdl = props.sdl;
    const createDeploymentResult = await akash.tx.deployment.create.params({
      sdl: sdl
    });
    console.log(createDeploymentResult);
    const {
      dseq, gseq, oseq
    } = findDeploymentSequence(createDeploymentResult);

    // await wait(2);
    // console.log("Verify Deployment is Open");
    // const queryDeploymentResult = await akash.query.deployment.get.params({
    //   owner: account.address,
    //   dseq: dseq
    // });
    // console.log(queryDeploymentResult);
    // console.log("");

    // await wait(2);
    // console.log("Verify Order is Open");
    // const queryMarketOrderResult = await akash.query.market.order.get.params({
    //   owner: account.address,
    //   dseq: dseq,
    //   gseq: gseq,
    //   oseq: oseq
    // });
    // console.log(queryMarketOrderResult);
    // console.log("");
    console.log(dseq, gseq, oseq);

    await wait(5);

    let haveBids = false;
    let queryMarketBidResult;
    while(!haveBids) {
      console.log("Query Bids");
      queryMarketBidResult = await akash.query.market.bid.list.params({
        owner: account.address,
        dseq: dseq
      });
      console.log(queryMarketBidResult);
      console.log("");
      haveBids = queryMarketBidResult.bids.length > 0
      await wait(2);
    }
    
    return { dseq, gseq, oseq, queryMarketBidResult };
  };

  const createLease = async () => {
    if (!akash) {
      return;
    }
    const sdl = props.sdl;
    const { dseq, gseq, oseq } = createDeploymentResult;
    const provider = winProvider;
    console.log("Create a Lease");
    const marketLeaseCreate = await akash.tx.market.lease.create.params({
      dseq: dseq,
      oseq: oseq,
      gseq: gseq,
      provider: provider
    });
    console.log(marketLeaseCreate);
    console.log("");

    await wait(1);
    console.log("Confirm the Lease");
    const marketLeaseList = await akash.query.market.lease.list.params({
      owner: account.address,
      dseq: dseq
    });
    console.log(marketLeaseList);
    console.log("");

    await wait(1);
    console.log("Query Provider");
    const providerGet = await akash.query.provider.get.params({
      provider: provider
    });
    console.log(providerGet);
    console.log("");

    await wait(5);

    console.log("Send the Manifest");
    const providerSendManifest = await akash.provider.sendManifest.params({
      sdl: sdl,
      dseq: dseq,
      provider: provider,
      proxy: PROVIDER_GATEWAY
    });
    console.log(providerSendManifest);
    console.log("");


    await wait(5);

    console.log("Provider Lease Status");
    const leaseStatus = await akash.provider.leaseStatus.params({
      dseq: dseq, oseq: oseq, gseq: gseq, provider: provider, proxy: PROVIDER_GATEWAY
    });
    console.log(leaseStatus);
    console.log("");

    return leaseStatus;
  }


  useEffect(() => {
    createDeployment().then((result) => {
      handleNext();
      setCreateDeploymentResult(result);
    });
  }, []);

  useEffect(() => {
    if (createDeploymentResult.dseq != null) {
      const bids = createDeploymentResult.queryMarketBidResult.bids;
      setBidsList(bids);
    }
  }, [createDeploymentResult]);

  useEffect(() => {
    if (winProvider !== '') {
      createLease().then((leaseStatus) => {
        handleNext();
        setLeaseStatusResult(leaseStatus);
      });
    }
  }, [winProvider]);

  useEffect(() => {
    if (activeStep === steps.length) {
      handleSetDismissable(true);
    }
  }, [activeStep, steps, handleSetDismissable]);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const getStepContent = (step: number, handleCloseDialog: any) => {
    switch (step) {
      case 0:
        return (
          <React.Fragment>
            <Typography>
              {`Submit your deployment to the blockchain via Keplr. This generates an order on the Akash marketplace.`}
            </Typography>
            <Button
              onClick={handleCloseDialog}
              color="secondary"
              className={classes.button}
            >
              Cancel
            </Button>
          </React.Fragment>
        );
      case 1:
        return (
          <React.Fragment>
            <Typography>
              {'The following providers bid on your order. Choose one:'}
            </Typography>
            <BidsForm
              bidsList={bidsList}
              handleChooseProvider={(provider: string) => {
                handleNext();
                setWinProvider(provider);
              }}
            />
          </React.Fragment>
        );
      case 2:
        return `Create a lease for the bid from the chosen provider via Keplr. Once created, your deployment manifest will be submitted to the provider.`;
      default:
        return 'Unknown step';
    }
  };

  return (
    <div className={classes.root}>
      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((label, index) => (
          <Step key={label}>
            <StepLabel
              StepIconProps={{ classes:{ root: classes.icon, active: classes.activeIcon, completed: classes.completedIcon } }}
            >{label}
            {
              activeStep === index &&
              <Box component="span" p={1}>
                <CircularProgress color="secondary" size={15}/>
              </Box>
            }
            </StepLabel>
            <StepContent>
              {/* {getStepContent(index, props.handleDialogClose)} */}
              {
              index === 0 && (
                <React.Fragment>
                  <Typography>
                    {`Submit your deployment to the blockchain via Keplr. This generates an order on the Akash marketplace.`}
                  </Typography>
                  <Button
                    onClick={props.handleDialogClose}
                    color="secondary"
                    className={classes.button}
                  >
                    Cancel
                  </Button>
                </React.Fragment>
              )
              }
              {
              index === 1 && (
                <React.Fragment>
                  <Typography>
                    {'The following providers bid on your order. Choose one:'}
                  </Typography>
                  <BidsForm
                    bidsList={bidsList}
                    handleChooseProvider={(provider: string) => {
                      handleNext();
                      setWinProvider(provider);
                    }}
                  />
                </React.Fragment>
              )
              }
              {
                index === 2 && `Create a lease for the bid from the chosen provider via Keplr. Once created, your deployment manifest will be submitted to the provider.`
              }
            </StepContent>
          </Step>
        ))}
      </Stepper>
      {activeStep === steps.length && (
        <Paper square elevation={0} className={classes.resetContainer}>
          <Typography>The provider has executed your workload! Your access details:</Typography>
          <div>
            <pre>
              {JSON.stringify(leaseStatusResult, null, 2)}
            </pre>
          </div>
        </Paper>
      )}
    </div>
  );
}