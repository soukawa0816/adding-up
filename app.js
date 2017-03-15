'use strict';
const fs = require('fs');
//fsはFileSystemの略で, ファイルを扱うためのモジュールをrezuireでよびだしている.
//呼び出し方がおそらく　${モジュール名} = require('${モジュール名}')
const readline = require('readline');
//readlineは１行ずつ読み込むためのモジュール
const rs = fs.ReadStream('./popu-pref.csv');
//Node.jsでは,fsではなく,殆どの場合ファイルをstreamとして処理する
//処理するためのstream作成
const rl = readline.createInterface({ 'input': rs, 'output' : {} });
//readlineオブジェクトのinput対象としてrs(作成したストリーム)を指定
const map = new Map();//key :都道府県　value :集計データのオブジェクト

//イベント処理の作成
rl.on('line',(lineString) => {
    const columns = lineString.split(',');
    //何かで区切られたやつを配列に突っ込むsplit
    const year = parseInt(columns[0])//string型をint型として突っ込む
    const prefecture = columns[2];
    const popu = parseInt(columns[7]);//15から19歳の人口情報をつっこむ
    if( year === 2010 || year === 2015){//文字列でつっこんでたらここも文字列にする
        let value = map.get(prefecture);//mapの雛形づくり
        if(!value){
            value ={
                p10: 0,
                p15: 0,
                change: null//変化率もとりあえず定義しておく
            }
        }
        
        if (year === 2010){
            value.p10 += popu;
        }

        if (year === 2015){
            value.p15 += popu;
        }

        map.set(prefecture,value);//値を更新


    }

});
//readlineした状態で, line　イベントが発生したら, lineStringをコンソールに表示
//lineStringは取り込んだ１行を示す

rl.resume();
//再びストリームを流すあんまよくわかってないこれ

rl.on('close', () => {
    for (let pair of map){//pair配列にmapをぶっこんでまわす（すべてのkeyにおいて
        //pair[0]　→key pair[1] value
        const value = pair[1];
        value.change = value.p15 /value.p10;
    }

    const rankingArray = Array.from(map).sort((p1,p2) =>{
        //Array.fromで配列に変換して大きい順にソート
       //return 100000;これだとソートされない
       return p2[1].change - p1 [1].change;//正だったら通るような比較関数

    });

    const rankingStrings = rankingArray.map((p)  => {
        //配列rankingArrayのすべての要素pに対して,以下の変更を加えたものがrankingStrings
        //pは配列rankingArrayの要素であるので, 要素一個一個がkeyとvalue p[0],p[1]をもつ
        return p[0] + ':' + p[1].p10 + '=>' + p[1].p15 + '変化率:' + p[1].change;

    });

    console.log(rankingStrings);

});