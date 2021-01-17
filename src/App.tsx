import React, {ChangeEvent, FormEvent, useEffect, useRef, useState} from 'react'
import {useHistory, Redirect, BrowserRouter, Route, Switch, Link, useParams, useRouteMatch} from 'react-router-dom'
import './App.css';
import './Firebase';
import {
    Button,
    Col,
    Form,
    InputGroup,
    Nav,
    Overlay,
    OverlayTrigger, Popover,
    Row,
    Spinner,
    Table,
    Tabs,
    ToggleButton,
    Tooltip
} from 'react-bootstrap'
import Tab from "react-bootstrap/Tab";
import 'bootstrap/dist/css/bootstrap.min.css';
import {ProductsManager, IProduct} from "./Products";
import {useListVals, useObjectVal} from "react-firebase-hooks/database";
import {plansRef, productsRef, recipesRef, rootRef} from "./Firebase";
import {addDays, format, compareAsc, isSameDay} from 'date-fns'
import _ from "lodash";
import {DndProvider} from 'react-dnd'
import {useDrag, useDrop} from "react-dnd";
import {HTML5Backend} from "react-dnd-html5-backend";
import {X, XSquare} from "react-bootstrap-icons";

/**
 * Basic info about a recipe
 */
interface SimpleRecipe {
    id: string
    title: string
    ingredients: string
    recipe: string
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

function toDayFormat(date: Date) {
    return format(date, dayFormat);
}

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
        };
    const chicken: SimpleRecipe =
        {
            id: 'chicken',
            title: 'Kurczak w cieście',
            ingredients: 'Kurczak, ciasto francuskie',
            recipe: 'Pieczemy w piekarniku',
        };
    const pizza: SimpleRecipe =
        {
            id: 'pizza',
            title: 'Pizza',
            ingredients: 'Mąka, ser żółty, pieczarki, kurczak',
            recipe: 'Pieczemy w piekarniku',
        }
    await plansRef.set({});
    await recipesRef.set({});
    await productsRef.set({});
    const recipes = [salad, chicken, pizza];
    for (const r of recipes)
        await addRecipe(r);


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
    for (const p of plans)
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

function RecipesTable(props: { baseUrl: string, handleRemove: any, search: string, recipes: Record<string, SimpleRecipe> }) {
    const {search, recipes} = props;
    const filtered = Object.values(recipes)
        .filter(r => r.title.toLowerCase().includes(search.toLowerCase()));
    filtered.sort((a, b) => {
        return a.id.localeCompare(b.id);
    });
    return <Table striped bordered hover>
        <tbody>
        {filtered
            .map(recipe =>
                <tr key={recipe.id}>
                    <td>
                        <Link to={`${props.baseUrl}/${recipe.id}`}>{getHighlightedText(recipe.title, search)}</Link>
                    </td>
                    <td><Button variant='outline-warning' onClick={() => props.handleRemove(recipe)}>Remove</Button></td>
                </tr>)
        }</tbody>
    </Table>
}

/*
 <h2>Meal plans</h2>
        <Table striped bordered hover>
            <thead>
            <th>Day</th>
            <th>Recipe</th>
            </thead>
            <tbody>
            {sorted.map(plan => {
                const recipe = recipes[plan.recipeId];
                const date = Date.parse(plan.date);
                const day = format(date, 'EEEE, do')
                const sameAsPrevious = plan.date == lastDay;
                lastDay = plan.date;
                return <tr>
                    {sameAsPrevious ? <></> : <td rowSpan={sorted.filter(p => p.date == plan.date).length}>{day}</td>}
                    <td><Link to={`recipes/${recipe.id}`}>{recipe.title}</Link></td>
                </tr>;
            })}
            </tbody>
        </Table>
 */

function PlanOverlay(props: { onRemove: () => void, plan: Plan, recipes: Record<string, SimpleRecipe>, rest: any }) {
    const {plan, recipes, rest} = props;
    const recipe = recipes[plan.recipeId]
    const style = {...rest.style, minWidth: '200px'}
    return <Popover id='plan-overlay' {...rest} style={style}>
        <Popover.Title as='h3'>{recipe.title}</Popover.Title>
        <Popover.Content>
            <X size={40} onClick={() => props.onRemove()}/>
        </Popover.Content>
    </Popover>
}

function F(props: any) {
    return <Popover id='left' {...props} >
        <Popover.Title as="h3">{`Popover left`}</Popover.Title>
        <Popover.Content>
            <strong>Holy guacamole!</strong> Check this info.
        </Popover.Content>
    </Popover>
}

function PlanUI(props: { plan: Plan, recipes: Record<string, SimpleRecipe> }) {
    const ref = useRef(null); // Initialize the reference
    const {plan, recipes} = props;
    // useDrag will be responsible for making an element draggable. It also expose, isDragging method to add any styles while dragging
    const [collectedProps, drag] = useDrag({
        // item denotes the element type, unique identifier (id) and the index (position)
        item: {type: 'plan', id: plan.id},
        // // collect method is like an event listener, it monitors whether the element is dragged and expose that information
        // collect: monitor => ({
        //     isDragging: monitor.isDragging()
        // })
    });
    drag(ref);

    function handleRemove(plan: Plan) {
        plansRef.child(plan.id).remove()
    }

    const recipe = recipes[plan.recipeId];
    return <OverlayTrigger
        trigger='click'
        overlay={props => {
            console.log(props);
            return <PlanOverlay onRemove={() => handleRemove(plan)} plan={plan} recipes={recipes} rest={props}/>;
        }}
        placement='bottom'
        rootClose={true}
        transition={false}
    >
        <div ref={ref} style={{margin: '8px 0px', borderRadius: '.25em', border: '1px solid rgb(26, 189, 214)'}}>
            {recipe.title}
        </div>
    </OverlayTrigger>
}


function DayPlans(props: { onDrop: (p: any) => void, date: Date, i: number, plans: Plan[], recipes: Record<string, SimpleRecipe> }) {
    const ref = useRef(null);
    const [collectedProps, drop] = useDrop({
        accept: 'plan',
        drop: props.onDrop
    });
    drop(ref);
    return <td ref={ref} style={{height: '100%', width: '14.28%'}}>
        {_.sortBy(props.plans, [p => p.dayOrder]).map(plan => <PlanUI recipes={props.recipes} plan={plan}/>)}
    </td>;
}

function Plans(props: { plans: Record<string, Plan>, recipes: Record<string, SimpleRecipe> }) {
    const {plans, recipes} = props;
    const sorted = _.sortBy(Object.values(plans), [p => p.date, p => p.dayOrder]);
    const today = new Date();
    const indexes = Array.from({length: 7}, (x, i) => i - 1);
    const plansByDate = _.groupBy(sorted, p => p.date);

    function handleDrop(item: any, date: Date) {
        const planId = item.id
        const plan = plans[planId]
        let movedDate = toDayFormat(date);
        const movedPlan: Plan = {
            ...plan,
            date: movedDate
        };
        const dayPlans = [..._.sortBy(plansByDate[toDayFormat(date)], p => p.dayOrder), movedPlan];
        const updates = Object.fromEntries(dayPlans.map((plan, i) => {
            return [plan.id, {...plan, dayOrder: i}];
        }));
        plansRef.update(updates);
    }

    return <>
        <h2>Meal schedule</h2>
        <DndProvider backend={HTML5Backend}>
            <Table striped bordered hover>
                <thead>
                {indexes.map(i => {
                    const date = addDays(today, i);
                    const day = format(date, 'EEEE, do')
                    return <th>{day}</th>
                })}
                </thead>
                <tbody>
                <tr>
                    {indexes.map(i => {
                        const date = addDays(today, i);
                        const s = toDayFormat(date);
                        const dayPlans = plansByDate[s] || []
                        return <DayPlans onDrop={item => handleDrop(item, date)} date={date} i={i} plans={dayPlans} recipes={recipes}/>;
                    })}
                </tr>
                </tbody>
            </Table>
        </DndProvider>
    </>
}

function Recipies() {
    const [_all, loading, ___]: [{ recipes: Record<string, SimpleRecipe>, plans: Record<string, Plan> } | undefined, boolean, unknown] = useObjectVal(rootRef);
    const [search, setSearch] = useState('');
    const {url, path} = useRouteMatch();
    const history = useHistory();
    if (loading) return <Spinner animation='border'/>;
    const all = _all || {recipes: {}, plans: {}};
    const recipes = all.recipes || {};
    const plans = all.plans || {};

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

    return <Switch>
        <Route path={`${path}`} exact>
            <Plans plans={plans} recipes={recipes}/>
            <h2>Recipes list</h2>
            <Link to={`${url}/new`}><Button variant={'outline-info'}>Add a recipe</Button></Link>
            <InputGroup>
                <InputGroup.Prepend>
                    <Button variant='outline-secondary' onClick={handleSearchClear}>x</Button>
                </InputGroup.Prepend>
                <Form.Control type='text' placeholder='Search' onChange={handleSearchChange} value={search}/>
            </InputGroup>
            <>
                <RecipesTable handleRemove={handleRemove} baseUrl={url} search={search}
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
