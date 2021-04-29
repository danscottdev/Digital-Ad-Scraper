import React from 'react';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import Collapse from '@material-ui/core/Collapse';
import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';


import AdRow from './AdRow';

const strapi = 'http://localhost:1337';

function JobRow(props) {

  const { jobData } = props;
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <React.Fragment>

      <TableRow>

        <TableCell style={{ width: 110 }}>
          <IconButton aria-label="expand row" size="small" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />} View Ads
          </IconButton>
        </TableCell>

        <TableCell component="th" scope="row" align="center">{jobData.id}</TableCell>
        <TableCell>{jobData.Title}</TableCell>
        <TableCell>{jobData.URL}</TableCell>
        <TableCell>{jobData.ads.length}</TableCell>
        <TableCell>{jobData.created_at}</TableCell>
        <TableCell><a href={strapi + "/" + jobData.screenshotFull} rel="noopener noreferrer" target="_blank">view full page screenshot</a></TableCell>

      </TableRow>

      <TableRow bgcolor="#e6efff">
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7} mx="auto" >
          <Collapse in={isOpen} timeout="auto" unmountOnExit>
            <Box >

              <Table size="small" aria-label="ads">

                <TableHead>
                  <TableRow>
                    <TableCell>&nbsp;</TableCell>
                    <TableCell>Ad ID</TableCell>
                    <TableCell>Ad Screenshot</TableCell>
                    <TableCell>Ad Link</TableCell>
                    <TableCell>Ad Position</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {jobData.ads.map((ad) => (
                    <AdRow adData={ad} key={ad.id} />
                  ))}
                </TableBody>

              </Table>

            </Box>
          </Collapse>
        </TableCell>


      </TableRow>


    </React.Fragment>


  )

}




export default JobRow;
