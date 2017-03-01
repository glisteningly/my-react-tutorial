import React from 'react';
import $ from 'jquery';
import Remarkable from 'remarkable';
import './CommentBox.css';


class Comment extends React.Component {
  rawMarkup() {
    let md = new Remarkable();
    let rawMarkup = md.render(this.props.children.toString());
    return {__html: rawMarkup};
  }

  render() {
    // let md = new Remarkable();
    return (
      <div className="comment">
        <h2 className="commentAuthor">
          {this.props.author}
        </h2>
        <span dangerouslySetInnerHTML={this.rawMarkup()}/>
      </div>
    );
  }
}

class CommentList extends React.Component {
  render() {
    let commentNodes = this.props.data.map(comment => {
      return (
        <Comment author={comment.author} key={comment.id}>
          {comment.text}
        </Comment>
      )
    });

    return (
      <div className="commentList">
        {commentNodes}
      </div>
    );
  }
}

class CommentFrom extends React.Component {
  constructor(props) {
    super(props);
    //初始化state
    this.state = {
      author: '',
      text: ''
    }
  }

  handleAuthorChange(e) {
    this.setState({author: e.target.value});
  }

  handleTextChange(e) {
    this.setState({text: e.target.value});
  }

  handleSubmit(e) {
    e.preventDefault();
    let author = this.state.author.trim();
    let text = this.state.text.trim();
    if (!author || !text) {
      return;
    }

    this.props.onCommentSubmit({author: author, text: text});
    this.setState({
      author: '',
      text: ''
    })

  }

  render() {
    return (
      <form className="commentForm" onSubmit={e => this.handleSubmit(e)}>
        <input type="text" placeholder="Your name" value={this.state.author}
               onChange={e => this.handleAuthorChange(e)}/>
        <input type="text" placeholder="Say something..." value={this.state.text}
               onChange={e => this.handleTextChange(e)}/>
        <input type="submit" value="Post"/>
      </form>
    );
  }
}

class CommentBox extends React.Component {
  constructor(props) {
    super(props);
    //初始化state
    this.state = {data: []};
    //须class中的函数绑定到this，之后单独使用函数时this才能指向正确
    this.loadCommentsFromServer = this.loadCommentsFromServer.bind(this);
  }

  loadCommentsFromServer() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function (data) {
        this.setState({data: data});
      }.bind(this),
      error: function (xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    })
  }

  handleCommentSubmit(comment) {
    let comments = this.state.data;
    comment.id = Date.now();
    let newComments = comments.concat([comment]);
    this.setState({data: newComments});
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      type: 'post',
      data: comment,
      success: function (data) {
        this.setState({data: data});
      }.bind(this),
      error: function (xhr, status, err) {
        this.setState({data: comments});
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    })
  }

  componentDidMount() {
    this.loadCommentsFromServer();
    //如果上面不进行绑定，此处在setIntervcal中执行loadCommentsFromServer, 会造成this的指向错误
    setInterval(this.loadCommentsFromServer, this.props.pollInterval);
  }

  render() {
    return (
      <div className="commentBox">
        <h1>评论Comments</h1>
        <CommentList data={this.state.data}/>
        <CommentFrom onCommentSubmit={comment => this.handleCommentSubmit(comment)}/>
      </div>
    );
  }
}

// ReactDOM.render(
//   <CommentBox url="/api/comments" pollInterval={2000}/>,
//   document.getElementById('content')
// );

export default CommentBox;
