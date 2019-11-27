import React, { Component } from 'react';

import { FaGithubAlt, FaPlus, FaSpinner, FaTrash } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { Form, SubmitButton, List, InputForm } from './styles';
import Container from '../../components/Container';

import 'react-toastify/dist/ReactToastify.css';

import api from '../../services/api';

export default class Main extends Component {
  state = {
    newRepo: '',
    repositories: [],
    loading: false,
  };

  componentDidMount() {
    const repositories = localStorage.getItem('repositories');
    if (repositories) {
      this.setState({ repositories: JSON.parse(repositories) });
    }
  }

  componentDidUpdate(_, prevState) {
    const { repositories } = this.state;
    if (prevState.repositories !== repositories) {
      localStorage.setItem('repositories', JSON.stringify(repositories));
    }
  }

  handleInputChange = e => {
    this.setState({ newRepo: e.target.value });
  };

  handleDelete = repository => {
    this.setState({
      repositories: this.state.repositories.filter(r => r !== repository),
    });
  };

  handleSubmit = async e => {
    e.preventDefault();

    try {
      this.setState({ loading: true });
      const { newRepo, repositories } = this.state;

      if (newRepo === '') throw new Error('Write the name of some repository');

      const response = await api.get(`/repos/${newRepo}`);

      const hasRepo = repositories.find(
        r => r.name === response.data.full_name
      );

      if (hasRepo) throw new Error('Duplicated Repository');

      const data = {
        name: response.data.full_name,
      };

      this.setState({
        repositories: [...repositories, data],
        newRepo: '',
        loading: false,
      });
    } catch (error) {
      this.setState({
        errorInput: true,
        errorMessage: error.response
          ? toast.error(error.response.data.message)
          : toast.error(error.message),
      });
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    const { newRepo, repositories, loading, errorInput } = this.state;
    return (
      <Container>
        <ToastContainer autoClose={2000} position="top-center" />
        <h1>
          <FaGithubAlt />
          Repositories
        </h1>

        <Form onSubmit={this.handleSubmit}>
          <InputForm
            errorInput={errorInput}
            type="text"
            placeholder="Add repository"
            value={newRepo}
            onChange={this.handleInputChange}
          />

          <SubmitButton loading={loading ? 1 : 0}>
            {loading ? (
              <FaSpinner color="#FFF" size={14} />
            ) : (
              <FaPlus color="#FFF" size={14} />
            )}
          </SubmitButton>
        </Form>
        <List>
          {repositories.map(repository => (
            <li key={repository.name}>
              <span>{repository.name}</span>
              <span className="svgList">
                <Link to={`/repository/${encodeURIComponent(repository.name)}`}>
                  Details
                </Link>
                <FaTrash
                  key={repository}
                  onClick={() => this.handleDelete(repository)}
                />
              </span>
            </li>
          ))}
        </List>
      </Container>
    );
  }
}
