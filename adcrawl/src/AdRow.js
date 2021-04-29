import React from 'react';

import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';

const strapi = 'http://localhost:1337';

function AdRow(props) {
  const { adData } = props;

  return (
    <TableRow className="ad-row">
      <TableCell>&nbsp;</TableCell>
      <TableCell component="th" scope="row">
        {adData.id}
      </TableCell>
      <TableCell align="right">
        <a href={strapi + "/" + adData.ad_screenshot} rel="noopener noreferrer" target="_blank"><img src={strapi + "/" + adData.ad_screenshot} alt={adData.ad_position} /></a>
        <br />
        <div className="img-label"><a href={strapi + "/" + adData.ad_screenshot} target="_blank" rel="noopener noreferrer">click to see full size</a></div>
      </TableCell>
      <TableCell className="ad-row__link">{adData.ad_link}</TableCell>
      <TableCell align="right">{adData.ad_position}</TableCell>
    </TableRow>
  )

}

export default AdRow;