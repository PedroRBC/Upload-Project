import React, { Component } from "react";
import { uniqueId } from "lodash";
  import { filesize } from "filesize";

import api from "./services/api";

import GlobalStyle from "./styles/global";
import { Container, Content } from "./styles";

import Upload from "./components/Upload";
import FileList from "./components/FileList";
import socket from "./services/socketio";

class App extends Component {
  state = {
    uploadedFiles: []
  };

  

  async componentDidMount() {
    const response = await api.get("UploadFiles");

    this.setState({
      uploadedFiles: response.data.map(file => ({
        id: file.id,
        name: file.name,
        readableSize: filesize(file.size),
        preview: file.url,
        uploaded: true,
        url: file.url
      }))
    });

    socket.on('newfile',async (file)=>{
      const NewFile ={
        id: file.id,
        name: file.name,
        readableSize: filesize(file.size),
        preview: file.url,
        uploaded: true,
        url: file.url
      }
      const NewList = await this.state.uploadedFiles.concat(NewFile)
      this.setState({
        uploadedFiles:NewList })
    })

    socket.on('deletefile', async(files)=>{
      this.setState({
        uploadedFiles:files.map(file => ({
        id: file.id,
        name: file.name,
        readableSize: filesize(file.size),
        preview: file.url,
        uploaded: true,
        url: file.url
      }))})
    })
  }

  handleUpload = files => {
    const uploadedFiles = files.map(file => ({
      file,
      id: uniqueId(),
      name: file.name,
      readableSize: filesize(file.size),
      preview: URL.createObjectURL(file),
      progress: 0,
      uploaded: false,
      error: false,
      url: null
    }));

    this.setState({
      uploadedFiles: this.state.uploadedFiles.concat(uploadedFiles)
    });

    uploadedFiles.forEach(this.processUpload);
  };

  updateFile = (id, data) => {
    this.setState({
      uploadedFiles: this.state.uploadedFiles.map(uploadedFile => {
        return id === uploadedFile.id
          ? { ...uploadedFile, ...data }
          : uploadedFile;
      })
    });
  };

  processUpload = uploadedFile => {
    const data = new FormData();
    console.log('>',uploadedFile)
    data.append("file", uploadedFile.file, uploadedFile.name);

    api
      .post("UploadFiles", data, {
        onUploadProgress: e => {
          const progress = parseInt(Math.round((e.loaded * 100) / e.total));

          this.updateFile(uploadedFile.id, {
            progress
          });
        }
      })
      .then(response => {

        this.setState({
          uploadedFiles: this.state.uploadedFiles.filter(file => file.id !== uploadedFile.id)
        });


      })
      .catch(() => {
        this.updateFile(uploadedFile.id, {
          error: true
        });
      });
  };

  handleDelete = async id => {
    await api.delete(`UploadFiles/${id}`);
  };

  componentWillUnmount() {
    this.state.uploadedFiles.forEach(file => URL.revokeObjectURL(file.preview));
  }

  render() {
    const { uploadedFiles } = this.state;

    return (
      <Container>
        <Content>
          <Upload onUpload={this.handleUpload} />
          {!!uploadedFiles.length && (
            <FileList files={uploadedFiles} onDelete={this.handleDelete} />
          )}
        </Content>
        <GlobalStyle />
      </Container>
    );
  }
}

export default App;
