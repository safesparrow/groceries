import React, {FormEvent, useState} from 'react'
import {BrowserRouter, Route, Switch, Link, useParams, useRouteMatch} from 'react-router-dom'
import './App.css';
import './Firebase';
import {Button, Col, Form, Nav, Spinner, Table, Tabs} from 'react-bootstrap'
import Tab from "react-bootstrap/Tab";
import 'bootstrap/dist/css/bootstrap.min.css';
import {ProductsManager, IProduct} from "./Products";
import {useListVals, useObjectVal} from "react-firebase-hooks/database";
import {productsRef, recipesRef} from "./Firebase";

/**
 * Basic info about a recipe
 */
interface SimpleRecipe {
    id: string
    title: string
    recipe: string
}

function RecipeForm(props: { onSubmit: (r: SimpleRecipe) => void }) {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    function handleTitle(e: any) {
        setTitle(e.target.value)
        e.preventDefault()
    }

    function handleContent(e: any) {
        setContent(e.target.value)
        e.preventDefault()
    }

    function handleSubmit(e: FormEvent) {
        const recipe: SimpleRecipe = {
            id: "",
            title: title,
            recipe: content
        }
        props.onSubmit(recipe)
        e.preventDefault()
    }

    return <Form onSubmit={handleSubmit}>
        <Form.Row>
            <Col xs='auto'>
                <Form.Control type='text' placeholder='Title' value={title} onChange={handleTitle}/>
            </Col>
        </Form.Row>
        <Form.Row>
            <Col xs='auto'>
                <Form.Control type='textarea' value={content} onChange={handleContent}/>
            </Col>
        </Form.Row>
        <Form.Row>
            <Col xs='auto'>
                <Button variant='primary' type='submit'>Save</Button>
            </Col>
        </Form.Row>
    </Form>;
}

function Recipies() {

    const [_recipes, loading, _]: [SimpleRecipe[] | undefined, boolean, unknown] = useListVals<SimpleRecipe>(recipesRef);
    const recipes = _recipes || []

    function onAdd(recipe: SimpleRecipe) {
        let ref = recipesRef.push()
        recipe.id = ref.key!
        ref.set(recipe).then(() => {
            // setName('');
        })
    }

    function handleRemove(toRemove: SimpleRecipe) {
        recipesRef.child(toRemove.id).remove()
    }

    return <>
        {loading ? <Spinner animation='border'/>
            :
            <Table striped bordered hover>
                <tbody>
                {recipes.map(p =>
                    <tr key={p.id}>
                        <td>{p.title}</td>
                        <td><Button variant='outline-warning' onClick={() => handleRemove(p)}>Remove</Button></td>
                    </tr>
                )}
                </tbody>
            </Table>
        }
        <RecipeForm onSubmit={onAdd}/>
    </>
}

function App() {
    return (
        <BrowserRouter>
            <Nav
                // activeKey="recipes"
                // onSelect={(selectedKey) => alert(`selected ${selectedKey}`)}
            >
                <Nav.Item>
                    <Nav.Link as={Link} eventKey='active' to="/">Home</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link as={Link} eventKey="recipes" to='/recipes'>Recipes</Nav.Link>
                </Nav.Item>
            </Nav>
            <div>
                <Switch>
                    <Route path='/' exact>
                        <Tabs>
                            <Tab eventKey='recipies' title='Recipies'>
                                <Recipies/>
                            </Tab>
                            <Tab eventKey='products' title='Products'>
                                <ProductsManager/>
                            </Tab>
                        </Tabs>
                    </Route>
                    <Route path='/recipes'>
                        <Recipies/>
                    </Route>
                </Switch>
            </div>
        </BrowserRouter>
    );
}

export default App;
