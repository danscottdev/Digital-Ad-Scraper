import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import RestoreIcon from '@material-ui/icons/Restore';
import FavoriteIcon from '@material-ui/icons/Favorite';
import LocationOnIcon from '@material-ui/icons/LocationOn';

import Box from '@material-ui/core/Box';


import { Link } from 'react-router-dom';

const useStyles = makeStyles({
  root: {
    backgroundColor: '#cccccc',
    marginBottom: 50
  },
  menu: {
    textAlign: 'center'
  }
});

export default function SimpleBottomNavigation() {
  const classes = useStyles();
  const [value, setValue] = React.useState(0);

  return (
    <Box className={classes.root}>

      <BottomNavigation
        value={value}
        onChange={(event, newValue) => {
          setValue(newValue);
        }}
        showLabels
        className={classes.root}
      >

        <BottomNavigationAction label="URL Scraper" component={Link} to="/" value="scraper" icon={<RestoreIcon />} />
        <BottomNavigationAction label="Saved Scrapes" component={Link} to="/data" icon={<FavoriteIcon />} />
        <BottomNavigationAction label="Strapi Admin" component={Link} to="/admin" icon={<LocationOnIcon />} />

      </BottomNavigation>
    </Box>
  );
}
