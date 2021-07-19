import React, { useEffect, useState } from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import SearchIcon from '@material-ui/icons/Search';
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import InputAdornment from '@material-ui/core/InputAdornment';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import FormControl from '@material-ui/core/FormControl';
import Typography from '@material-ui/core/Typography';
import CardContent from '@material-ui/core/CardContent';
import Card from '@material-ui/core/Card';
import Grid from '@material-ui/core/Grid';
import { SDLCard } from './SDLCard';


export const SDLGallery = (props: any) => {
  const [galleryData, setGalleryData] = useState<{category: string, sdlRefs:{title: string, ref: string}[]}[]>([]);
  const [filteredGalleryData, setFilteredGalleryData] = useState<{category: string, sdlRefs:{title: string, ref: string}[]}[]>([]);
  const [searchValue, setSearchValue] = useState('');

  const numCols = 3;

  useEffect(() => {
    const AWESOME_AKASH_README = 'https://raw.githubusercontent.com/ovrclk/awesome-akash/master/README.md';
    fetch(AWESOME_AKASH_README).then((r) => r.text()).then(d => {
      const gallery:{category: string, sdlRefs:{title: string, ref: string}[]}[] = [];
      d.split('###').slice(1).forEach((section, i) => {
        const parts = section.split(/\r?\n/);
        const category = parts[0].trim();
        const sdlRefs:{title: string, ref: string}[] = []
        parts.forEach((bullet) => {
          if (bullet.length > 3 && bullet.slice(0, 3) === "- [") {
            const title = bullet.substring(bullet.indexOf('[') + 1, bullet.indexOf(']'));
            const ref = bullet.substring(bullet.indexOf('(') + 1, bullet.indexOf(')'));
            if (ref.indexOf('http') === -1) {
              sdlRefs.push({ title: title, ref: ref });
            }
          }
        });
        if (sdlRefs.length > 0) {
          gallery.push({
            category: category,
            sdlRefs: sdlRefs
          })
        }
      });
      setGalleryData(gallery);
      setFilteredGalleryData(gallery);
    });
  }, []);

  const useStyles = makeStyles((theme: Theme) =>
    createStyles({
      root: {
        width: '100%',
        backgroundColor: theme.palette.background.paper,
        position: 'relative',
        overflow: 'auto',
        maxHeight: 'calc(100vh - 250px)',
        marginBottom: "-10px",
        padding: 0
      },
      listSection: {
        backgroundColor: 'inherit',
      },
      ul: {
        backgroundColor: 'inherit',
        padding: 0,
      },
      loading: {
        display: "flex",
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center"
      }
    }),
  );

  const classes = useStyles();

  return (
    <React.Fragment>
      {filteredGalleryData.length === 0 && <div className={classes.loading}><CircularProgress color="secondary" /></div>}
      {filteredGalleryData.length > 0 && (
        <React.Fragment>
        <FormControl fullWidth variant="outlined">
          <OutlinedInput
            value={searchValue}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              const value = event.target.value;
              const filtered:{category: string, sdlRefs:{title: string, ref: string}[]}[] = [];
              galleryData.forEach(({category, sdlRefs}) => {
                if (category.toLowerCase().indexOf(value.toLowerCase()) !== -1) {
                  filtered.push({category, sdlRefs});
                } else {
                  const filteredRefs:{title: string, ref: string}[] = [];
                  sdlRefs.forEach(({title, ref}) => {
                    if (title.toLowerCase().indexOf(value.toLowerCase()) !== -1 || ref.toLowerCase().indexOf(value.toLowerCase()) !== -1) {
                      filteredRefs.push({title, ref});
                    }
                  });
                  if (filteredRefs.length > 0) {
                    filtered.push({category, sdlRefs: filteredRefs});
                  }
                }
              });
              setFilteredGalleryData(value === "" ? galleryData : filtered);
              setSearchValue(value);
            }}
            placeholder="Search for SDL" 
            color="secondary"
            startAdornment={<InputAdornment position="start"><SearchIcon /></InputAdornment>}
          />
        </FormControl>
        <List className={classes.root} subheader={<li />}>
          {filteredGalleryData.map(({category, sdlRefs}) => (
            <li key={`section-${category}`} className={classes.listSection}>
              <ul className={classes.ul}>
                <ListSubheader>{category}</ListSubheader>
                <ListItem key={`item-${category}`}>
                  <Grid container spacing={3}>
                  {Array.from(Array(Math.floor(sdlRefs.length - 1 / numCols) + 1).keys()).map((row) => (
                    <Grid container item xs={12} spacing={3}>
                      {Array.from(Array(numCols).keys()).filter((col) => (row * numCols) + (col + 1) <= sdlRefs.length).map((col) => (
                        <Grid item xs={4}>
                          <SDLCard key={`card-${row},${col}`} sdlRef={sdlRefs[row * numCols + col]} goToDeployTab={props.goToDeployTab} setDeploySDL={props.setDeploySDL}/>
                        </Grid>
                      ))}
                    </Grid>
                  ))}
                  </Grid>
                </ListItem>
              </ul>
            </li>
          ))}
        </List>
        </React.Fragment>
      )}
    </React.Fragment>
  );
};