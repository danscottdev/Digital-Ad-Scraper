import React from 'react';

import PropTypes from 'prop-types';
import { makeStyles, withStyles, useTheme } from '@material-ui/core/styles';

import Box from '@material-ui/core/Box';
import TableContainer from '@material-ui/core/TableContainer';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableFooter from '@material-ui/core/TableFooter';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TablePagination from '@material-ui/core/TablePagination';
import Paper from '@material-ui/core/Paper';

import IconButton from '@material-ui/core/IconButton';
import FirstPageIcon from '@material-ui/icons/FirstPage';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import LastPageIcon from '@material-ui/icons/LastPage';

import JobRow from './JobRow';

const strapi = 'http://localhost:1337';

const DataLog = () => {
  // Output data from prior job scrapes

  const [results, setResults] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);

  const StyledTableCell = withStyles((theme) => ({
    head: {
      backgroundColor: '#000000',
      color: '#FFFFFF',
    },
    body: {
      fontSize: 14,
    },
  }))(TableCell);

  const StyledTableRow = withStyles((theme) => ({
    root: {
      '&:nth-of-type(odd)': {
        backgroundColor: "#FF0000",
      },
    },
  }))(TableRow);


  // API call to back-end, return all 'job' entries
  async function fetchData() {
    setIsLoading(true);

    // Make API call to strapi - return all 'jobs' saved in database
    try {
      const requestConfig = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const response = await fetch(strapi + '/jobs/all', requestConfig);
      const json = await response.json();

      if (json.error) {
        console.log('no json', json);
        setIsLoading(false);
        return false;
      }

      setResults(json);
      setIsLoading(false);
    }
    catch (err) {
      setIsLoading(false);
      console.log(err);
    }
  }


  // Pagination
  const useStyles1 = makeStyles((theme) => ({
    root: {
      flexShrink: 0,
      marginLeft: theme.spacing(2.5),
    },
  }));

  function TablePaginationActions(props) {
    const classes = useStyles1();
    const theme = useTheme();
    const { count, page, rowsPerPage, onChangePage } = props;

    const handleFirstPageButtonClick = (event) => {
      onChangePage(event, 0);
    };

    const handleBackButtonClick = (event) => {
      onChangePage(event, page - 1);
    };

    const handleNextButtonClick = (event) => {
      onChangePage(event, page + 1);
    };

    const handleLastPageButtonClick = (event) => {
      onChangePage(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
    };

    return ( //pagination controls
      <div className={classes.root}>
        <IconButton
          onClick={handleFirstPageButtonClick}
          disabled={page === 0}
          aria-label="first page"
        >
          {theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
        </IconButton>
        <IconButton onClick={handleBackButtonClick} disabled={page === 0} aria-label="previous page">
          {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
        </IconButton>
        <IconButton
          onClick={handleNextButtonClick}
          disabled={page >= Math.ceil(count / rowsPerPage) - 1}
          aria-label="next page"
        >
          {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
        </IconButton>
        <IconButton
          onClick={handleLastPageButtonClick}
          disabled={page >= Math.ceil(count / rowsPerPage) - 1}
          aria-label="last page"
        >
          {theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
        </IconButton>
      </div>
    );
  }

  TablePaginationActions.propTypes = {
    count: PropTypes.number.isRequired,
    onChangePage: PropTypes.func.isRequired,
    page: PropTypes.number.isRequired,
    rowsPerPage: PropTypes.number.isRequired,
  };

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, results.length - page * rowsPerPage);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };


  return ( // Table output
    <Box className="data">

      {results.length === 0 &&
        <div>
          <div className={"loading " + (isLoading ? 'show' : 'hidden')}>Loading Saved Results from Database</div>
          <button onClick={fetchData}>RUN</button>
        </div>
      }

      {results !== null &&
        <TableContainer component={Paper} className="data-table">
          <Table aria-label="data table">

            <TableHead>
              <TableRow className="data-table__header">
                <StyledTableCell>&nbsp;</StyledTableCell>
                <StyledTableCell align="center">Job ID</StyledTableCell>
                <StyledTableCell align="center">Site Name</StyledTableCell>
                <StyledTableCell align="center">URL Crawled</StyledTableCell>
                <StyledTableCell align="center">Ads Found</StyledTableCell>
                <StyledTableCell align="center">Date of Crawl</StyledTableCell>
                <StyledTableCell align="center">Screenshot</StyledTableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {(rowsPerPage > 0
                ? results.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                : results
              ).map((job) => (
                <JobRow jobData={job} key={job.id} />
              ))}
            </TableBody>

            <TableFooter>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
                  colSpan={3}
                  count={results.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  SelectProps={{
                    inputProps: { 'aria-label': 'rows per page' },
                    native: true,
                  }}
                  onChangePage={handleChangePage}
                  onChangeRowsPerPage={handleChangeRowsPerPage}
                  ActionsComponent={TablePaginationActions}
                />
              </TableRow>
            </TableFooter>

          </Table>
        </TableContainer>
      }

    </Box>
  )


}

/*
class DataLog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dataResults: null,
      isDataLoading: false,
    }
  }

  // Fetch data from database to display historical results
  fetchData = async () => {
    this.setState({ isDataLoading: true })

    try {
      const requestConfig = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const response = await fetch(strapi + '/jobs/all', requestConfig);
      const json = await response.json();
      if (json.error) {
        console.log('no json', json);
        this.setState({ isDataLoading: false });
        return false;
      }
      console.log('json', json);
      this.setState({ isDataLoading: false, dataResults: json });
    }
    catch (err) {
      this.setState({ isDataLoading: false })
      console.log(err);
    }
  }


  render() {

    return (

      <Box className="data">
        <h2>All Data:</h2>

        {this.state.dataResults === null &&
          <div>
            <div className={"loading " + (this.state.isDataLoading ? 'show' : 'hidden')}>Loading Saved Results from Database</div>
            <button onClick={this.fetchData}>RUN</button>
          </div>
        }

        {this.state.dataResults !== null &&
          <TableContainer component={Paper} className="data-table">
            <Table aria-label="simple table">

              <TableHead>
                <TableRow className="data-table__header">
                  <TableCell>&nbsp;</TableCell>
                  <TableCell align="center">Job ID</TableCell>
                  <TableCell align="center">Site Name</TableCell>
                  <TableCell align="center">URL Crawled</TableCell>
                  <TableCell align="center">Ads Found</TableCell>
                  <TableCell align="center">Date of Crawl</TableCell>
                  <TableCell align="center">Screenshot</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {this.state.dataResults.map((row) => (
                  <JobRow row={row} key={row.id} />
                ))}
              </TableBody>

            </Table>
          </TableContainer>
        }

      </Box>
    )
  }
}
*/

export default DataLog;