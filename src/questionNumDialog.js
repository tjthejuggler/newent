import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

class QuestionNumDialog extends Component {

    render(){



    	return(

      <Dialog open={this.props.showQuestionNumDialog}
              aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">{this.props.questionNumDialogHeader}</DialogTitle>
        <DialogContent>
          <DialogContentText>{this.props.questionNumDialogText}</DialogContentText>
            <TextField
              autoFocus
              ref="myField"
              margin="dense"
              id="number"
              label="Number of questions:"
              onChange={(e)=>this.props.handleQuestionNumChange(e)}
              onKeyPress={(e)=>this.props.handleQuestionNumKeyPress(e)}
              fullWidth/>
        </DialogContent>
          <DialogActions>
            <Button onClick={()=>this.props.handleQuestionNumSubmit()}>OK</Button>
          </DialogActions>
      </Dialog>

      )

	}

}

export default QuestionNumDialog