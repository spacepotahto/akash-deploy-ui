import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import CodeMirror from '@uiw/react-codemirror';
import 'codemirror/keymap/sublime';
import 'codemirror/theme/monokai.css';
import React, { useEffect } from 'react';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DeployStepper from './DeployStepper';
import { SDL, loadPEMBlocks } from 'akashjs';
import { useAccount } from '../utils/AccountContext';

export const DeploySDL = (props: any) => {
  const account = useAccount();
  let sdl = props.sdl;

  const [open, setOpen] = React.useState(false);
  const [certAlert, setCertAlert] = React.useState(false);
  const [sdlAlert, setSdlAlert] = React.useState(false);
  const [dismissable, setDismissable] = React.useState(false);
  const [codeInstance, setCodeInstance] = React.useState<any>(null);

  const handleClickOpen = async () => {
    // Check for valid cert
    const cert = await loadPEMBlocks(account.address).catch((e) => console.log(e));
    if (!cert) {
      setCertAlert(true);
      return;
    }

    // Check that SDL is valid
    try {
      const sdlVal = new SDL(codeInstance ? codeInstance.getValue() : sdl);
    } catch (e) {
      console.log(e);
      setSdlAlert(true);
      return;
    }
    
    // Open deployment dialog
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setCertAlert(false);
    setSdlAlert(false);
  };

  useEffect(() => {
    // For some reason, on every tab switch a new CodeMirror editor is added to the DOM
    // HACK: remove the old ones here on destroy.
    return () => {
      document.querySelectorAll('.CodeMirror').forEach((e) => e.remove());
    }
  }, []);

  return (
    <React.Fragment>
      <Box pb={2}>
      <Typography variant="h6">
        Deploy your App <Link 
        href="https://docs.akash.network/guides/deployment#create-your-configuration"
        target="_blank"
        rel="noopener"
        color="secondary">Configuration</Link>
      </Typography>
      </Box>
      <CodeMirror
        value={sdl}
        onChange={(instance, change) => { setCodeInstance(instance) }}
        options={{
          theme: 'monokai',
          keyMap: 'sublime',
          mode: 'yml',
        }}
        height={`calc(100vh - 300px)`}
        width="100%"
      />
      <Box pt={2}>
      <Button size="large"
        variant="contained"
        color="secondary"
        onClick={handleClickOpen}
      >
        Deploy!
      </Button>
      <Dialog
        open={open}
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            setOpen(false);
          }
        }}
        aria-describedby="deploy-dialog-stepper"
      >
        <DialogContent>
          <DialogContentText id="deploy-dialog-stepper">
            <DeployStepper
              sdl={open && new SDL(codeInstance ? codeInstance.getValue() : sdl)}
              handleDialogClose={handleClose}
              handleSetDismissable={setDismissable}
              updateBalance={props.updateBalance}
            ></DeployStepper>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="contained" color="secondary" disabled={!dismissable}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={certAlert}>
        <DialogContent>
          <DialogContentText>
            No valid certificate found. A valid certificate is required for deployments. Please go to "Certificate" tab to create one.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="contained" color="secondary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={sdlAlert}>
        <DialogContent>
          <DialogContentText>
            Your SDL appears to be invalid. Please double check.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="contained" color="secondary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
      </Box>
    </React.Fragment>
  );
};