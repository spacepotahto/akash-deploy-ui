import React, { useEffect, useState } from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import AkashLogo from '../assets/1620312207-vertical-powered-by.svg';
import CertificateOutline from 'mdi-material-ui/CertificateOutline';
import StoreIcon from '@material-ui/icons/Store';
import BackupIcon from '@material-ui/icons/Backup';
import RocketLaunch from 'mdi-material-ui/RocketLaunch'
import { WalletDisplay } from './WalletDisplay';
import { makeStyles } from '@material-ui/core/styles';
import TabContext from '@material-ui/lab/TabContext';
import Tab from '@material-ui/core/Tab';
import TabList from '@material-ui/lab/TabList';
import TabPanel from '@material-ui/lab/TabPanel';
import Typography from '@material-ui/core/Typography';
import { DeploySDL } from './DeploySDL';
import { ManageCertificate } from './ManageCertificate';
import { DeploymentList } from './DeploymentList';
import { useAccount } from '../utils/AccountContext';
import LoadingBackdrop from './LoadingBackdrop';
import { SDLGallery } from './SDLGallery';
import { SAMPLE_SDL } from '../common/constants';

interface Props {
  children: React.ReactElement;
}

const ElevationScroll = (props: Props) => {
  const { children } = props;

  return React.cloneElement(children, {
    elevation: 0
  });
}

const useTabStyles = makeStyles({
  root: {
    flexGrow: 1,
  },
  tabpanel: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center"
}
});

export const App = () => {
  const account = useAccount();
  const akash = account.akash;

  const [balance, setBalance] = useState(0);
  const [sdl, setSdl] = React.useState(
    '# Sample SDL that describes a Lunie Wallet frontend deployment.\n' +
    '# Deploy it as is, edit it, or replace with your own!\n\n' +
    SAMPLE_SDL);

  const updateBalance = async () => {
    if (!akash) {
      return;
    }
    const b = await akash.query.bank.balance(account.address, 'uakt');
    setBalance(Number(b.amount));
  };

  useEffect(() => {
    updateBalance();
  }, [account]);

  const tabClasses = useTabStyles();
  const [value, setValue] = React.useState('1');
  const handleChange = (event: React.ChangeEvent<{}>, newValue: string) => {
    setValue(newValue);
  };

  const goToDeployTab = () => {
    setValue("1");
  };

  const setDeploySDL = (sdl: string) => {
    setSdl(sdl);
  };
  
  return (
    <React.Fragment>
      <Box className={tabClasses.root}>
        <TabContext value={value}>
          <ElevationScroll>
            <Box>
              <AppBar>
                <Box mx={10}>
                <Toolbar>
                  <Box width={200} height={72}>
                    <img src={AkashLogo} style={{ height: '100%' }} alt="Akash" />
                  </Box>
                  <Box className={tabClasses.root}>
                    <TabList
                      onChange={handleChange}
                      indicatorColor="secondary"
                      textColor="secondary"
                      centered
                    >
                      <Tab icon={<RocketLaunch />} label="DEPLOY" value="1" />
                      <Tab icon={<StoreIcon />} label="SDL GALLERY" value="2" />
                      <Tab icon={<BackupIcon />} label="MY DEPLOYMENTS" value="3" />
                      <Tab icon={<CertificateOutline />} label="CERTIFICATE" value="4" />
                    </TabList>
                  </Box>
                  <Box width={200}>
                    <WalletDisplay balance={balance}/>
                  </Box>
                </Toolbar>
                </Box>
              </AppBar>
            </Box>
          </ElevationScroll>
          <Toolbar />
          <Container maxWidth="md">
            <TabPanel value="1">
              <Box className={tabClasses.tabpanel}>
                <DeploySDL sdl={sdl} updateBalance={updateBalance}/>
              </Box>
            </TabPanel>
            <TabPanel value="2">
              <SDLGallery goToDeployTab={goToDeployTab} setDeploySDL={setDeploySDL}/>
            </TabPanel>
            <TabPanel value="3">
              <DeploymentList updateBalance={updateBalance}/>
            </TabPanel>
            <TabPanel className={tabClasses.tabpanel} value="4">
              <ManageCertificate updateBalance={updateBalance}/>
            </TabPanel>
          </Container>
        </TabContext>
      </Box>
      <LoadingBackdrop open={account.address === ''} />
    </React.Fragment>
  );
}