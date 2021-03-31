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
    percentage: number,
    synergy?:number //synergy with the pokemon in the row and the pokemon being filtered.
}

interface Props{
    stats:SimmedStats,
    filteredTeam?:{team:Array<string>,winRate:number}, //this provides the win rate for the filtered portion
    overallWinRates?: SimmedStats,
    onPokemonImageClick?:(pokeName:string)=>void
}

const WinLossTable: React.FunctionComponent<Props> = (props) => {
   
   const getRows = () => {
        let recordsAsArr: WinLossData[] = [];
        
        for (let key in props.stats) {

            if (props.filteredTeam?.team.includes(key)){
                continue;         
            }
            
            const record = props.stats[key];
            const recordRow: WinLossData =     {
                key: key,
                rank:0, //will update later on in the function, after we have sorted.
                name: key,
                image: key,
                wins: record.wins,
                losses: record.losses,
                percentage: Math.round(100 * (record.wins / (record.losses + record.wins)))
            };

            if (props.filteredTeam!==undefined){
                const otherPokemonWinRate = Math.round(100 *(props.overallWinRates![key].wins / (props.overallWinRates![key].wins + props.overallWinRates![key].losses)));
                const partyWinRate = props.filteredTeam.winRate;


                //to avoid divide by 0 errors.
                const otherWinRateToUse = otherPokemonWinRate === 100 ? 99.9999: otherPokemonWinRate;
                const partyWinRateToUse = partyWinRate === 100 ? 99.9999: partyWinRate;
                //convert to fractional odds
                let expectedWinRate2 = ( otherPokemonWinRate/ (100-otherWinRateToUse) ) * (partyWinRate / (100-partyWinRateToUse)) //this should give a ratio expressed in X to 1.
                expectedWinRate2 = expectedWinRate2 === 0 ? 0 : expectedWinRate2 /(1+expectedWinRate2) //should give like 0.6 or whatever
                expectedWinRate2*=100;
                expectedWinRate2 = Math.round(expectedWinRate2);

                recordRow.synergy = recordRow.percentage- expectedWinRate2; //the difference in actual win percentage vs the expected win percentage based on overall stats.
            }

            recordsAsArr.push(recordRow);
        }
        recordsAsArr = recordsAsArr.sort( (a:WinLossData,b:WinLossData)=> b.percentage - a.percentage || b.wins - a.wins);

        recordsAsArr.forEach((record,index)=>{
            record.rank=(index+1)
        });


        return recordsAsArr;
    }



    const tableColumns: ColumnsType<WinLossData> = [
        { title: "rank", key: "rank", dataIndex:"rank",sorter:(a,b)=>b.rank - a.rank},
        { title: "image", dataIndex: "image", key: "image", render: (image: string) => <div className="clickable" onClick={()=>{if (props.onPokemonImageClick!==undefined) { props.onPokemonImageClick(image)}}}><PokemonImage name={image} type="front" /></div> },
        { title: "name", dataIndex: "name", key: "name" },
        { title: "wins", dataIndex: "wins", key: "wins", sorter: (a, b) => b.wins - a.wins },
        { title: "losses", dataIndex: "losses", key: "losses", sorter: (a, b) => b.losses - a.losses },
        { title: "percentage", dataIndex: "percentage", key: "percentage", sorter: (a, b) => b.percentage - a.percentage }
    ]

    if (props.filteredTeam!==undefined){
        tableColumns.push({title:"Synergy Level (+/- above expected win rate)",key:"synergy",dataIndex:"synergy",sorter:(a,b)=>b.synergy!-a.synergy!})
    }



    return (<Table columns={tableColumns} dataSource={getRows()} />)

}

export default WinLossTable