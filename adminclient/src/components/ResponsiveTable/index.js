import React, { Component, PropTypes, } from 'react';
import * as rb from 're-bulma';
// import styles from '../styles';


const propTypes = {
  hasPagination: PropTypes.bool,
  hasHeader: PropTypes.bool,
  hasFooter: PropTypes.bool,
  itemCount: PropTypes.number.isRequired,
  maxRows: PropTypes.number,
  currentPage: PropTypes.number,
  numButtons: PropTypes.number,
};

const defaultProps = {
  hasPagination: true,
  hasHeader: false,
  hasFooter: false,
  maxRows: 50,
  currentPage: 1,
  itemCount: 100,
  numButtons: 3,
};

class ResponsiveTable extends Component {

  constructor(props) {
    super(props);
    this.state = {
      headers: [],
      rows: [],
      hasPagination: props.hasPagination,
      hasHeader: props.hasHeader,
      hasFooter: props.hasFooter,
      maxRows: props.maxRows,
      currentPage: props.currentPage,
      numItems: props.itemCount,
      numPages: 20,
      numButtons: props.numButtons,
    };
  }

  render() {
    const { numPages, currentPage, } = this.state;
    const pageButtons = [];
    const lastIndex = numPages - 1;

    let start = currentPage - 2;
    let end = currentPage;
    if (start < 0) {
      end += -start;
      start = 0;
    }
    if (end > lastIndex) {
      if (start > 0) {
        start -= (end - lastIndex);
        if (start < 0) {
          start = 0;
        }
      }
      end = lastIndex;
    }

    if (start > 0) {
      pageButtons.push((
        <li key={0}>
          <rb.PageButton isActive={currentPage === 1}>1</rb.PageButton>
        </li>
      ));
      pageButtons.push(<li key="dot-before">...</li>);
    }

    for (let index = start; index <= end; index += 1) {
      const inActive = ((index + 1) !== currentPage);
      if (inActive) {
        pageButtons.push((
          <li key={index}>
            <rb.PageButton>{index + 1}</rb.PageButton>
          </li>
        ));
      } else {
        pageButtons.push((
          <li key={index}>
            <rb.PageButton color="isPrimary" isActive>{index + 1}</rb.PageButton>
          </li>
        ));
      }
    }

    if (end < lastIndex) {
      pageButtons.push(<li key="dot-after">...</li>);
      pageButtons.push((
        <li key={lastIndex}>
          <rb.PageButton>{lastIndex + 1}</rb.PageButton>
        </li>
      ));
    }
    const footer = (
      <rb.Pagination>
        <rb.PageButton>Previous</rb.PageButton>
        <rb.PageButton>Next</rb.PageButton>
        <ul>
          {pageButtons}
        </ul>
      </rb.Pagination>);
    return (
      <rb.Container>
        <rb.Table>
          <rb.Thead>
            <rb.Tr>
              {this.state.headers.map((header, idx) => (
                <rb.Th key={idx}>{header.label}</rb.Th>
              ))}
            </rb.Tr>
          </rb.Thead>
          <rb.Tbody>
            {this.state.rows.map(row => (
              <rb.Tr>
                {this.state.headers.map((header) => {
                  if (row[header.sortid].isUrl) return (
                    <rb.Td><a href={row[header.sortid].url}>{row[header.sortid].value}</a></rb.Td>
                  );
                  return (
                    <rb.Td>{row[header.sortid]}</rb.Td>
                  );
                })}
              </rb.Tr>
              ))}
          </rb.Tbody>
        </rb.Table>
        {this.state.hasPagination ? footer : ''}
      </rb.Container>
    );
  }
}

ResponsiveTable.propType = propTypes;
ResponsiveTable.defaultProps = defaultProps;

export default ResponsiveTable;
