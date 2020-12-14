import React, {ChangeEvent, FormEvent, useEffect, useState} from 'react'
import {useHistory, Redirect, BrowserRouter, Route, Switch, Link, useParams, useRouteMatch} from 'react-router-dom'
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

function RecipeForm(props: { recipe : SimpleRecipe | null, onSubmit: (r: SimpleRecipe) => void }) {
    const {recipe} = props;
    const [title, setTitle] = useState(recipe ? recipe.title : '');
    const [content, setContent] = useState(recipe ? recipe.recipe : '');

    function handleTitle(e: any) {
        setTitle(e.target.value)
        e.preventDefault()
    }

    function handleContent(e: any) {
        setContent(e.target.value)
        e.preventDefault()
    }

    function handleSubmit(e: FormEvent) {
        const r: SimpleRecipe = {
            id: recipe ? recipe.id : '',
            title: title,
            recipe: content
        }
        e.preventDefault()
        props.onSubmit(r)
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

function RecipePlain(props: { recipe: SimpleRecipe }) {
    const {recipe} = props;
    return <div>
        <h2>{recipe.title}</h2>
        <div>{recipe.recipe}</div>
    </div>
}

function Recipe(props: { onEdit:(r: SimpleRecipe, clb: () => void) => void, recipes: Record<string, SimpleRecipe> }) {
    const {recipeId} = useParams<{ recipeId: string }>();
    const [isEdit, setIsEdit] = useState(false);
    const recipe = props.recipes[recipeId];
    return <div>
        {recipe
            ?
            <>
            {!isEdit && <Button onClick={() => setIsEdit(true)}>Edit</Button>}
                {isEdit
                    ? <div>
                        <Button onClick={() => setIsEdit(false)} variant='outline-warning'>Discard changes</Button>
                        <RecipeForm recipe={recipe} onSubmit={r => props.onEdit(r, () => setIsEdit(false))} />
                    </div>
                    :
                    <div>
                        <RecipePlain recipe={recipe}/>
                    </div>
                }
            </>
            : <>No recipe with that id found</>
        }
    </div>
}

function Recipies() {

    const [_recipes, loading, _]: [Record<string, SimpleRecipe> | undefined, boolean, unknown] = useObjectVal<Record<string, SimpleRecipe>>(recipesRef);
    const recipes = _recipes || {}
    const [search, setSearch] = useState('');

    const {url, path} = useRouteMatch();
    const history = useHistory();

    function onAdd(recipe: SimpleRecipe) {
        let ref = recipesRef.push()
        recipe.id = ref.key!
        ref.set(recipe).then(() => {
            history.push(`${url}`)
        })
    }

    function handleRemove(toRemove: SimpleRecipe) {
        recipesRef.child(toRemove.id).remove()
    }

    function handleSearchChange(e: ChangeEvent<HTMLInputElement>) {
        setSearch(e.currentTarget.value)
    }
    
    function handleOnEdit(r : SimpleRecipe, clb : () => void){
        //const {id, ...recipeDto} = r;
        recipesRef.child(r.id).set(r).then(() => clb());
    }

    return <Switch>
        <Route path={`${path}`} exact>
            <Link to={`${url}/new`}><Button variant={'outline-info'}>Add a recipe</Button></Link>
            <Form.Control type='text' placeholder='Search' onChange={handleSearchChange}/>
            {loading ? <Spinner animation='border'/>
                :
                <Table striped bordered hover>
                    <tbody>
                    {Object.entries(recipes).filter(([k, p]) => p.title.includes(search)).map(([k, p]) =>
                        <tr key={p.id}>
                            <td><Link to={`${url}/${p.id}`}>{p.title}</Link></td>
                            <td><Button variant='outline-warning' onClick={() => handleRemove(p)}>Remove</Button></td>
                        </tr>
                    )}
                    </tbody>
                </Table>
            }
        </Route>
        <Route path={`${path}/new`} exact>
            <RecipeForm recipe={null} onSubmit={onAdd}/>
        </Route>
        <Route path={`${path}/:recipeId`}>
            <Recipe onEdit={handleOnEdit} recipes={recipes}/>
        </Route>
    </Switch>
}

function App() {
    return (
        <BrowserRouter>
            <Nav>
                <Nav.Item>
                    <Nav.Link as={Link} eventKey="recipes" to='/recipes'>Recipes</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link as={Link} eventKey="products" to='/products'>Products</Nav.Link>
                </Nav.Item>
            </Nav>
            <div>
                <Switch>
                    <Route path='/products'><ProductsManager/></Route>
                    <Route path={['/recipes']}><Recipies/></Route>
                    <Redirect to={{pathname: '/recipes'}}/>
                </Switch>
            </div>
        </BrowserRouter>
    );
}

export default App;
