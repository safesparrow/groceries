import React, {ChangeEvent, FormEvent, useEffect, useState} from 'react'
import {useHistory, Redirect, BrowserRouter, Route, Switch, Link, useParams, useRouteMatch} from 'react-router-dom'
import './App.css';
import './Firebase';
import {Button, Col, Form, InputGroup, Nav, Row, Spinner, Table, Tabs, ToggleButton} from 'react-bootstrap'
import Tab from "react-bootstrap/Tab";
import 'bootstrap/dist/css/bootstrap.min.css';
import {ProductsManager, IProduct} from "./Products";
import {useListVals, useObjectVal} from "react-firebase-hooks/database";
import {plansRef, productsRef, recipesRef} from "./Firebase";
import { addDays, format, compareAsc } from 'date-fns'

/**
 * Basic info about a recipe
 */
interface SimpleRecipe {
    id: string
    title: string
    ingredients: string
    recipe: string
    isPlanned: boolean
}

interface Plan {
    id: string
    recipeId: string
    date: string // YYYY-MM-DD
    dayOrder: number
}

function addRecipe(recipe: SimpleRecipe) {
    let ref = recipesRef.push()
    recipe.id = ref.key!
    return ref.set(recipe);
}

const dayFormat = 'yyyy-MM-dd';
function toDayFormat(date : Date){ return format(date, dayFormat); }

function addPlan(plan: Plan) {
    let ref = plansRef.push()
    plan.id = ref.key!
    return ref.set(plan);
}

async function resetTestData() {
    const salad: SimpleRecipe =
        {
            id: 'salad',
            title: 'sałatka z kurczakiem',
            ingredients: 'kurczak, sałata',
            recipe: 'tak robimy sałatkę',
            isPlanned: false
        };
    const chicken: SimpleRecipe =
        {
            id: 'chicken',
            title: 'Kurczak w cieście',
            ingredients: 'Kurczak, ciasto francuskie',
            recipe: 'Pieczemy w piekarniku',
            isPlanned: false
        };
    const pizza: SimpleRecipe =
        {
            id: 'pizza',
            title: 'Pizza',
            ingredients: 'Mąka, ser żółty, pieczarki, kurczak',
            recipe: 'Pieczemy w piekarniku',
            isPlanned: false
        }
    await recipesRef.set({});
    const recipes = [salad, chicken, pizza];
    for (const r of recipes)
        await addRecipe(r);
    
    await productsRef.set({});
    
    await plansRef.set({});
    const today = new Date()
    const plans: Plan[] = [
        {
            id: 'plan1',
            recipeId: chicken.id,
            date: toDayFormat(today),
            dayOrder: 1
        },
        {
            id: 'plan2',
            recipeId: salad.id,
            date: toDayFormat(today),
            dayOrder: 2
        },
        {
            id: 'plan3',
            recipeId: pizza.id,
            date: toDayFormat(addDays(today, 1)),
            dayOrder: 2
        }
    ]
    for(const p of plans)
        await addPlan(p);
}

function RecipeForm(props: { recipe: SimpleRecipe | null, onSubmit: (r: SimpleRecipe) => void }) {
    const {recipe} = props;
    const [title, setTitle] = useState(recipe ? recipe.title : '');
    const [ingredients, setIngredients] = useState(recipe ? recipe.ingredients : '');
    const [content, setContent] = useState(recipe ? recipe.recipe : '');

    function handleTitle(e: ChangeEvent<HTMLInputElement>) {
        setTitle(e.target.value)
    }

    function handleIngredients(e: ChangeEvent<HTMLInputElement>) {
        setIngredients(e.target.value);
    }

    function handleContent(e: ChangeEvent<HTMLInputElement>) {
        setContent(e.target.value)
    }

    function handleSubmit(e: FormEvent) {
        const r: SimpleRecipe = {
            id: recipe ? recipe.id : '',
            title: title,
            ingredients: ingredients,
            recipe: content,
            isPlanned: recipe ? recipe.isPlanned : false
        }
        e.preventDefault()
        props.onSubmit(r)
    }

    return <Form onSubmit={handleSubmit}>
        <Form.Group>
            <Form.Control type='text' placeholder='Title...' value={title} onChange={handleTitle}/>
        </Form.Group>
        <Form.Group>
            <Form.Control as='textarea' placeholder='Ingredients...' rows={6} value={ingredients} onChange={handleIngredients}/>
        </Form.Group>
        <Form.Group>
            <Form.Control as='textarea' placeholder='Recipe...' rows={20} value={content} onChange={handleContent}/>
        </Form.Group>
        <Form.Group>
            <Button variant='primary' type='submit'>Save</Button>
        </Form.Group>
    </Form>;
}

function RecipePlain(props: { recipe: SimpleRecipe }) {
    const {recipe} = props;
    return <div>
        <h2>{recipe.title}</h2>
        <h4>Ingredients:</h4>
        <div>{recipe.ingredients}</div>
        <h4>Przepis</h4>
        <div>{recipe.recipe}</div>
    </div>
}

function Recipe(props: { onEdit: (r: SimpleRecipe, clb: () => void) => void, recipes: Record<string, SimpleRecipe> }) {
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
                        <RecipeForm recipe={recipe} onSubmit={r => props.onEdit(r, () => setIsEdit(false))}/>
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

function getHighlightedText(text: string, highlight: string) {
    // Split on highlight term and include term into parts, ignore case
    const parts = highlight.trim() == '' ? [text] : text.split(new RegExp(`(${highlight})`, 'gi'));
    return <span> {parts.map((part, i) => part.toLowerCase() === highlight.toLowerCase() ? <mark>{part}</mark> :
        <span>{part}</span>)} </span>;
}

function RecipesTable(props: { baseUrl: string, changePlanned: any, handleRemove: any, search: string, recipes: Record<string, SimpleRecipe> }) {
    const {search, recipes} = props;
    const filtered = Object.values(recipes)
        .filter(r => r.title.toLowerCase().includes(search.toLowerCase()));
    filtered.sort((a, b) => {
        if (a.isPlanned === b.isPlanned) return a.id.localeCompare(b.id);
        return a.isPlanned ? -1 : 1;
    });
    return <Table striped bordered hover>
        <tbody>
        {filtered
            .map(recipe =>
                <tr key={recipe.id}>
                    <td>
                        <Link to={`${props.baseUrl}/${recipe.id}`}>{getHighlightedText(recipe.title, search)}</Link>
                    </td>
                    <td>
                        <Form.Group>
                            <Form.Label>Planned
                                <Form.Check type='checkbox' checked={recipe.isPlanned}
                                            onChange={() => props.changePlanned(recipe)}/>
                            </Form.Label>
                        </Form.Group>
                    </td>
                    <td><Button variant='outline-warning' onClick={() => props.handleRemove(recipe)}>Remove</Button></td>
                </tr>)
        }</tbody>
    </Table>
}

function Recipies() {

    const [_recipes, loadingRecipes, _]: [Record<string, SimpleRecipe> | undefined, boolean, unknown] = useObjectVal<Record<string, SimpleRecipe>>(recipesRef);
    const [_plans, loadingPlans, __]: [Record<string, Plan> | undefined, boolean, unknown] = useObjectVal<Record<string, Plan>>(plansRef);
    const loading = loadingRecipes || loadingPlans;
    const recipes = _recipes || {};
    const plans = _plans || {};
    const [search, setSearch] = useState('');

    const {url, path} = useRouteMatch();
    const history = useHistory();

    function onAdd(recipe: SimpleRecipe) {
        addRecipe(recipe).then(() => {
            history.push(`${url}`)
        })
    }

    function handleRemove(toRemove: SimpleRecipe) {
        recipesRef.child(toRemove.id).remove();
    }

    function handleSearchChange(e: ChangeEvent<HTMLInputElement>) {
        setSearch(e.currentTarget.value.trim())
    }

    function handleOnEdit(r: SimpleRecipe, clb: () => void) {
        recipesRef.child(r.id).set(r).then(() => clb());
    }

    function handleSearchClear() {
        setSearch('');
    }

    function changePlanned(recipe: SimpleRecipe) {
        recipesRef.child(recipe.id).set({...recipe, isPlanned: !recipe.isPlanned})
    }

    return loading ?
        <Spinner animation='border'/>
        :
        <Switch>
            <Route path={`${path}`} exact>
                <Link to={`${url}/new`}><Button variant={'outline-info'}>Add a recipe</Button></Link>
                <InputGroup>
                    <InputGroup.Prepend>
                        <Button variant='outline-secondary' onClick={handleSearchClear}>x</Button>
                    </InputGroup.Prepend>
                    <Form.Control type='text' placeholder='Search' onChange={handleSearchChange} value={search}/>
                </InputGroup>
                <>
                    {/*<PlannedRecipes recipes={recipes.filter(r => r.ispl)} />*/}
                    <RecipesTable changePlanned={changePlanned} handleRemove={handleRemove} baseUrl={url} search={search}
                                  recipes={recipes}/>
                </>
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
                <Nav.Item>
                    <Button onClick={() => resetTestData()}>Reset data</Button>
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
