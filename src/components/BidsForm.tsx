import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import Button from '@material-ui/core/Button';

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(3),
  },
  button: {
    margin: theme.spacing(1, 1, 0, 0),
  },
}));

export default function BidsForm(props: any) {
  const classes = useStyles();
  const [value, setValue] = React.useState('');

  console.log(props.bidsList);

  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue((event.target as HTMLInputElement).value);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    console.log("PROVIDER", value);
    props.handleChooseProvider(value);
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormControl component="fieldset" className={classes.formControl}>
        <RadioGroup aria-label="providers" name="providers" value={value} onChange={handleRadioChange}>
          {
            props.bidsList.map((bid: any) => (
              <FormControlLabel value={bid.bid.bidId.provider} control={<Radio />} label={bid.bid.bidId.provider} />
            ))
          }
        </RadioGroup>
        <Button type="submit" variant="outlined" color="secondary" className={classes.button}>
          Submit
        </Button>
      </FormControl>
    </form>
  );
}