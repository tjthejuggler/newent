import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

class IntroDialog extends Component {

    render(){



    	return(
			<Dialog open={this.props.showIntroDialog}
              		aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">{this.props.introDialogHeader}</DialogTitle>
        <DialogContent>
          <DialogContentText>{this.props.introDialogText}</DialogContentText>
          	{this.props.displayIntroDialogButtons ?
	            <TextField
	              autoFocus
	              ref="myField"
	              margin="dense"
	              id="name"
	              label="Game name:"
	              onChange={(e,f)=>this.props.handleIntroChange(e,f)}
	              onKeyPress={(e)=>this.props.handleIntroKeyPress(e)}
	              fullWidth/> :''}
        </DialogContent>
        <DialogActions>
        {this.props.displayIntroDialogButtons ?
        <div>
	        <Button onClick={()=>this.props.handleIntroSubmit()}>Create</Button>
	        <Button onClick={()=>this.props.handleIntroSubmit()}>Join</Button> 
        </div>:''}
        </DialogActions>
      </Dialog>
      )

	}

}

export default IntroDialog