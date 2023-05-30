forModel(m => <fieldset
    className={m.className}
    visible={m.visible}>
    {m.content?.forEach(i =>
        <label>
            <input type="radio" name="selector"
                on-change={Bind.action((_, ev) => (ev.currentTarget as HTMLInputElement).checked ? m.value = m.itemsSource.getValue(i) : undefined)} />
            <span>{m.itemsSource.getText(i)}</span>
        </label>
    )}
</fieldset>)