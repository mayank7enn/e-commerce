import { ReactElement } from "react";
import TableHOC from "../components/admin-styles/TableHOC"
import { Column } from "react-table";
import { useState } from "react";
import { Link } from "react-router-dom";

type DataType = {
    _id: string;
    amount: number;
    quantity: number;
    discount: number;
    status: ReactElement;
    action: ReactElement;
}

const column: Column<DataType>[] = [
    {
        Header: "ID",
        accessor: "_id"
    }, {
        Header: "Quantity",
        accessor: "quantity"
    },{
        Header: "Discount",
        accessor: "discount"
    },{
        Header: "Amount",
        accessor: "amount"
    },{
        Header: "Status",
        accessor: "status"
    },{
        Header: "Action",
        accessor: "action"
    }
]

const orders = () => {

    const [rows] = useState<DataType[]>([
        {
            _id: "1", 
            amount: 100, 
            quantity: 1, 
            discount: 0, 
            status: <span className="red">Processing</span>, 
            action: <Link to={`/order/1`}>View</Link>},
    ])
    const Table = TableHOC<DataType>(
        column, 
        rows, 
        "dashboard-product-box", 
        "Orders", 
        rows.length > 6
    )()
  return (
    <div>
        <div className="container">
            <h1>My Orders</h1>
            {Table}
        </div>
    </div>
  )
}

export default orders