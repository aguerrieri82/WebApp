
export default function MainPage(props: {message: string}) {

    return <main>
        <h1>$(project-name) Home</h1>
        <div>{props.message}</div>
    </main>;
}
