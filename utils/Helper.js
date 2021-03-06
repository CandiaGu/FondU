import React, { Component } from 'react';
import {
  Text,
  View,
} from 'react-native';
import ParsedText from 'react-native-parsed-text';
import fetch from './Fetch';

export function getMatch(query){
  return fetch('GET', 'search', { query })
    .then((responseJson) =>{
      this.setState({matches:responseJson.article_ids})
    })
  .catch((error)=>{
    console.log(error)
  });
}

/*When using renderText and createISC make sure to bind the functions
  within the constructor:

  this.renderText = renderText.bind(this);
  this.createISC = createISC.bind(this);
  */

  /* renderText returns a list of the text within the specified tag*/
  /*if you need to add tags you can format it as
  else if (tag == 'whatver identifier you want'){
    pattern = /<tag>(.*?)<\/tag>/gi;*/

export function renderText(content, tag) {
    let pattern;
    var isArray = false;
    if (tag == 'Description'){
      pattern = /<Description>(.*?)<\/Description>/i;
    }else if (tag == 'Example'){
      pattern = /<Example>(.*?)<\/Example>/i;
    }else if (tag == 'Question'){
      pattern = /<Question>(.*?)<\/Question>/i;
    }else if (tag == 'Answer'){
      pattern = /<Answer>(.*?)<\/Answer>/i;
    }else if (tag == 'Theory'){
      pattern = /<Theory>(.*?)<\/Theory>/i;
    }else if (tag == 'i'){
      pattern = /<i>(.*?)<\/i>/gi;
    }else if (tag == 'Research'){
        pattern = /<Research>(.*?)<\/Research>/gi;
        isArray = true;
    }else if (tag == 'Suggestion'){
        pattern = /<Suggestion>(.*?)<\/Suggestion>/gi;
        isArray = true;
    }else if (tag == 'SuggestionIcon'){
          pattern = /<SuggestionIcon>(.*?)<\/SuggestionIcon>/gi;
          isArray = true;
    }else if (tag == 'Reference'){
        pattern = /<Reference>(.*?)<\/Reference>/gi;
        isArray = true;
    }else if (tag == 'isc'){
        pattern = /<isc>(.*?)<\/isc>/gi;
        isArray = true;
    }
    var result = content.match(pattern)
    if (result == null) return;
    if (isArray){
      result = result.map((group,i)=>{
        group = group.replace('<'+tag+'>','');
        group = group.replace('</'+tag+'>','');
        return group
      })
      return result
    }
    return (content.match(pattern))[1];
  }

//parses through text with given tags, and turns the isc into a button
export function createISC(text, tag, endtag){
      //console.log("tag to read\t\t\t"+tag);

      let result = text.map((res,i) =>{

        var citList = this.renderText(res, 'isc');

        var start = [];
        start[0] = 0;
        if (citList){
        let citations = citList.map((cit,i) =>{
          var index = res.indexOf('<isc>',start[0]);
          var sub = res.substring(start[0], index);
          start[0] = res.indexOf('</isc>') + 6;
          return <Text style = {{flexDirection: 'row'}}>
            <Text>{sub}</Text>
            <Text onPress={() => this.setState({showRef:true})}>{cit}</Text>
            </Text>
        });
        var remaining = res.substring(start[0]);
        start[0] = remaining.indexOf('</isc>') + 6;
        remaining = remaining.substring(start[0]);


        return<Text style = {{flexDirection: 'row'}}>
          {citations}
          <Text>{remaining}</Text>
          </Text>
        }else{
          return<Text style = {{flexDirection: 'row'}}>
            <Text>{res}</Text>
            </Text>
        }
      });
      return result;
    }



  export function italicize(res){
          //var title = this.renderText(res, 'i');
          var start = 0;
          var index = res.indexOf('<i>',start);
          var subStart = res.substring(start, index);
          var end = res.indexOf('</i>');
          var subEnd = res.substring(index +3,end);
          var remaining = res.substring(end+4)

          return<Text style = {{flexDirection: 'row'}}>
              <Text>{subStart}</Text>
              <Text style = {{ fontFamily: 'poppins-italic'}}>{subEnd}</Text>
              <Text>{remaining}</Text>
              <Text>{'\n\n'}</Text>
              </Text>
    }


  export function getIcon(content){
    let pattern = /(.*)\/(.*)/i;
    var res = content.match(pattern)
    return [res[1],res[2]]
  }
