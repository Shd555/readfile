import axios from 'axios';

export function fetchFileContent(name = 'web_act_20230817103926180.txt') {
  return axios.get('http://localhost:8080/api/file', {
    params: { name }
  }).then(res => res.data);
}