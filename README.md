<h1>Overbuild tool</h1>
Tool for managing terminal/shell commands for different projects.

<h2>Building</h2>
Required: <b>Node</b>, <b>npm</b>, and <b>Typescript</b>. Then [1]:
<code>
    npm install && tsc --project src
</code>
After that, you can also use the tool to build itslef in order to learn more about it:
<code>
    overbuild build
</code>
Be aware that, if you change something and the build results in a broken state, you can not use a broken overbuild to build itself.


<h2>How to use</h2>
<h3>Config files</h3>
This is the heart of the tool. It will work without, but makes it useless. Place a file <i>overbuild.json</i> in every 
directory where you want to specify some parameters / commands. These config files will be then used as command
and parameter storage. See in overbuild's source above how the config file is used in oerbuild's case -- it should give you a good overview
of what this tool is about.
</br>
When overbuild fails to find an argument within a config file, it will go up the directory structure to see if the others have it.

<h4>Usage scenario:</h4>
You have the following directory structure:
<pre>
    overbuild.json // [1]
    project1/
        overbuild.json // [2]
    project2/
        overbuild.json // [3]
</pre>

In [1] you can, for example, specify servers, credentials, paths to tools. In [2] and [3] you can then use the stuff from [1] to make
your commands more versatile and easier to read.

<h3>How to write config files</h3>
<h4>Predefined arguments and values</h4>
<ul>
    <li>Argument: <i>-cwd</i> - used to specify the working directory where the command should be executed.
    <li>Argument: <i>-chain</i> - used to chain another command after the current one successfuly executed.
    <li>Parameter: <i>${rootDir}</i> - returns the top-most directory that contains overbuild.json.
    <li>Parameter: <i>${thisDir}</i> - returns the directory the current overbuild.json is placed in.
    <li>Parameter: <i>${workDir}</i> - returns the directory from where overbuild was called from.
    <li>Parameter: <i>${args.xyz}</i> - goes from where overbuild was called in, to ${rootDir}, to search for xyz in all overbuild.json files.
</ul>