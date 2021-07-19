import React from 'react';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Button from '@material-ui/core/Button';
import GitHubIcon from '@material-ui/icons/GitHub';
import RocketLaunch from 'mdi-material-ui/RocketLaunch'
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    actionsRoot: {
      justifyContent: 'space-evenly'
    }
  }),
);

export const SDLCard = (props: any) => {
  const classes = useStyles();

  const constructSourceLink = (refName: string) => {
    return `https://github.com/ovrclk/awesome-akash/tree/master/${refName}`
  };

  const fetchSDL = async (refName: string) => {
    const url = `https://raw.githubusercontent.com/ovrclk/awesome-akash/master/${refName}/deploy.yaml`;
    return fetch(url).then(r => r.text());
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography gutterBottom variant="h5" component="h2">
          {props.sdlRef.title}
        </Typography>
      </CardContent>
      <CardActions className={classes.actionsRoot}>
        <Button size="medium" color="secondary" startIcon={<GitHubIcon />} href={constructSourceLink(props.sdlRef.ref)} target="_blank">
          Source
        </Button>
        <Button size="medium" color="secondary" startIcon={<RocketLaunch />} onClick={async () => {
          props.goToDeployTab();
          const sdl = await fetchSDL(props.sdlRef.ref);
          // organization: ovrclk.com no longer valid it seems
          props.setDeploySDL(sdl.replace('organization: ovrclk.com', 'host: akash'));
        }}>
          Deploy!
        </Button>
      </CardActions>
    </Card>
  );
};