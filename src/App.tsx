import React, {FormEvent, useState} from 'react'
import {Redirect, BrowserRouter, Route, Switch, Link, useParams, useRouteMatch} from 'react-router-dom'
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

    const [_recipes, loading, _]: [Record<string, SimpleRecipe> | undefined, boolean, unknown] = useObjectVal<Record<string, SimpleRecipe>>(recipesRef);
    const recipes = _recipes || []
    
    const { url, path } = useRouteMatch();
    
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
    console.log(url, path)

    return <Switch>
        <Route path={`${path}/`} exact>
            <Link to={`${url}/new`}><Button variant={'outline-info'}>Add a recipe</Button></Link>
            {loading ? <Spinner animation='border'/>
                :
                <Table striped bordered hover>
                    <tbody>
                    {Object.entries(recipes).map(([k,p]) =>
                        <tr key={p.id}>
                            <td>{p.title}</td>
                            <td><Button  variant='outline-warning' onClick={() => handleRemove(p)}>Remove</Button></td>
                        </tr>
                    )}
                    </tbody>
                </Table>
            }
        </Route>
        <Route path={`${path}/new`} exact>
            <RecipeForm onSubmit={onAdd}/>
        </Route>
    </Switch>
}

function App() {
    return (
        <BrowserRouter>
            <Nav
                // activeKey="recipes"
                // onSelect={(selectedKey) => alert(`selected ${selectedKey}`)}
            >
                <Nav.Item>
                    <Nav.Link as={Link} eventKey="recipes" to='/recipes'>Recipes</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link as={Link} eventKey="products" to='/products'>Products</Nav.Link>
                </Nav.Item>
            </Nav>
            <div>
                <Switch>
                    <Route path='/products'><ProductsManager /></Route>
                    <Route path={['/recipes']}><Recipies/></Route>
                    <Redirect to={{pathname: '/recipes'}} />
                </Switch>
            </div>
        </BrowserRouter>
    );
}

export default App;
