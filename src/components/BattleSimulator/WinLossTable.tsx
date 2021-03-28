import Table, { ColumnsType } from "antd/lib/table";
import PokemonImage from "components/PokemonImage/PokemonImage";
import React from "react";
import { SimmedStats } from "./SimulatorFunctions";


interface WinLossData {
    key: string,
    rank:number,
    name: string,
    image: string,
    wins: number,
    losses: number,
    percentage: number
}

interface Props{
    stats:SimmedStats
}

const WinLossTable: React.FunctionComponent<Props> = (props) => {
   
   const getRows = () => {
        let recordsAsArr: WinLossData[] = [];
        
        for (let key in props.stats) {

            const record = props.stats[key]
            recordsAsArr.push(
                {
                    key: key,
                    rank:0, //will update later on in the function, after we have sorted.
                    name: key,
                    image: key,
                    wins: record.wins,
                    losses: record.losses,
                    percentage: Math.round(100 * (record.wins / (record.losses + record.wins)))
                });

        }
        recordsAsArr = recordsAsArr.sort( (a:WinLossData,b:WinLossData)=> b.percentage - a.percentage || b.wins - a.wins);

        recordsAsArr.forEach((record,index)=>{
            record.rank=(index+1)
        });


        return recordsAsArr;
    }



    const tableColumns: ColumnsType<WinLossData> = [
        { title: "rank", key: "rank", dataIndex:"rank",sorter:(a,b)=>b.rank - a.rank},
        { title: "image", dataIndex: "image", key: "image", render: (image: string) => <PokemonImage name={image} type="front" /> },
        { title: "name", dataIndex: "name", key: "name" },
        { title: "wins", dataIndex: "wins", key: "wins", sorter: (a, b) => b.wins - a.wins },
        { title: "losses", dataIndex: "losses", key: "losses", sorter: (a, b) => b.losses - a.losses },
        { title: "percentage", dataIndex: "percentage", key: "percentage", sorter: (a, b) => b.percentage - a.percentage }
    ]


    return (<Table columns={tableColumns} dataSource={getRows()} />)

}

export default WinLossTable