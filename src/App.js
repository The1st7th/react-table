import React from "react";
import { render } from "react-dom";
import { makeData, Logo, Tips } from "./Utils";
import _ from "lodash";

// Import React Table
import ReactTable from "react-table";
import "react-table/react-table.css";

// pull in the HOC
import treeTableHOC from "react-table/lib/hoc/treeTable";

import testData from "./test_data2";


const reformattedData = testData.map(obj => {
    return { ...obj.body.attendee,
      error: obj.error,
      created_at: obj.created_at,
      function: obj.body.function
    }
  })
// wrap ReacTable in it
// the HOC provides the configuration for the TreeTable
const TreeTable = treeTableHOC(ReactTable);

function getTdProps(state, ri, ci) {
  console.log({ state, ri, ci });
  return {};
}

// getTdProps={getTdProps}
// Expander={Expander}

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      // data: makeData()
      data: reformattedData
    };
    this.dataload = this.dataLoad.bind(this);
  }

  componentDidMount() {
    //a second option for making the call via .fetch method

    // fetch('https://files.prolaera.com/errors/kinesis/msGraphStream-prod/msGraphStream-prod_08_13_2018.json')
    //   .then(function(response) {
    //     return response.json();
    //   })
    //   .then(function(myJson) {
    //     console.log(myJson);
    //   });
    console.log("component did mount")
    this.dataload().then(data => {
      this.setState({data});
    });
  }

  dataLoad() {
    return new Promise((resolve, reject) => {
      let xhr = new XMLHttpRequest();
      let url = "https://files.prolaera.com/errors/kinesis/msGraphStream-prod/msGraphStream-prod_08_13_2018.json";
      xhr.open("GET", url, true);
      xhr.responseType = "json";
      xhr.onload = function() {
        if(xhr.status === 200) {
          var newData = xhr.response;
          var reformattedData = newData.map(obj => {
              return { ...obj.body.attendee,
                error: obj.error,
                created_at: obj.created_at,
                function: obj.body.function
              }
            })
            resolve(reformattedData);
        } else {
          reject(Error(xhr.statusText));
        }
      }
      xhr.send();
    })
  }
  render() {
    const { data } = this.state;

    // now use the new TreeTable component
    return (
      <div>
        <TreeTable
          filterable
          defaultFilterMethod={(filter, row, column) => {
            const id = filter.pivotId || filter.id;
            return row[id] !== undefined
              ? String(row[id])
                  .toLowerCase()
                  .includes(filter.value.toLowerCase())
              : true;
          }}
          data={data}
          pivotBy={["company_id", "profile_uid"]}
          columns={[
            // we only require the accessor so TreeTable
            // can handle the pivot automatically
            {
              accessor: "company_id"
            },
            {
              accessor: "profile_uid"
            },

            // any other columns we want to display
            {
              Header: "Created At",
              accessor: "created_at"
            },
            {
              Header: "Function",
              accessor: "function"
            },
            {
              Header: "Error",
              accessor: "error"
            }
          ]}
          defaultPageSize={10}
          SubComponent={row => {
            // a SubComponent just for the final detail
            const columns = [
              {
                Header: "Property",
                accessor: "property",
                width: 200,
                Cell: ci => {
                  return `${ci.value}:`;
                },
                style: {
                  backgroundColor: "#DDD",
                  textAlign: "right",
                  fontWeight: "bold"
                }
              },
              { Header: "Value", accessor: "value" }
            ];
            const rowData = Object.keys(row.original).map(key => {
              return {
                property: key,
                value: row.original[key].toString()
              };
            });
            return (
              <div style={{ padding: "10px" }}>
                <ReactTable
                  data={rowData}
                  columns={columns}
                  pageSize={rowData.length}
                  showPagination={false}
                />
              </div>
            );
          }}
        />
        <br />
        <Tips />
        <Logo />
      </div>
    );
  }
}

export default App;
