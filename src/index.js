import React from 'react';
import ReactDOM from 'react-dom';
import CommentBox from './CommentBox';
import './index.css';

ReactDOM.render(
  <CommentBox url="http://localhost:8000/api/comments" pollInterval={2000}/>,
  document.getElementById('root')
);