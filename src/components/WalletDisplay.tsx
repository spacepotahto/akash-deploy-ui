import React from 'react';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet';
import { useAccount } from '../utils/AccountContext';

export const WalletDisplay = (props: any) => {
  const account = useAccount();

  const formatBalance = (balance: number, places: number) => {
    return (balance * 1e-6).toLocaleString(undefined, {
      minimumFractionDigits: places,
      maximumFractionDigits: places
    });
  };

  return (
    <Grid container direction="row" wrap="nowrap" justifyContent="flex-end" alignItems="center" spacing={2}>
      <Grid item>
        <AccountBalanceWalletIcon />
      </Grid>
      <Grid item container direction="column">
        <Grid item xs zeroMinWidth>
          <Typography variant="h6" noWrap>{account.name}</Typography>
        </Grid>
        <Grid item>
          <Typography variant="subtitle1">{`${formatBalance(props.balance || 0, 3)} AKT`}</Typography>
        </Grid>
      </Grid>
    </Grid>
  );
};