<template>
  <div class="bg-gray-900 min-h-screen text-white overflow-x-auto p-2 pb-10" @click="$refs.terminal.focus()">
    <pre>
 ________  ________   ________  _____ ______   _______   ________  ________  ________  ___  __       
|\   ____\|\   ___  \|\   __  \|\   _ \  _   \|\  ___ \ |\   __  \|\   __  \|\   ____\|\  \|\  \     
\ \  \___|\ \  \\ \  \ \  \|\  \ \  \\\__\ \  \ \   __/|\ \  \|\  \ \  \|\  \ \  \___|\ \  \/  /|_   
 \ \  \  __\ \  \\ \  \ \  \\\  \ \  \\|__| \  \ \  \_|/_\ \   _  _\ \  \\\  \ \  \    \ \   ___  \  
  \ \  \|\  \ \  \\ \  \ \  \\\  \ \  \    \ \  \ \  \_|\ \ \  \\  \\ \  \\\  \ \  \____\ \  \\ \  \ 
   \ \_______\ \__\\ \__\ \_______\ \__\    \ \__\ \_______\ \__\\ _\\ \_______\ \_______\ \__\\ \__\
    \|_______|\|__| \|__|\|_______|\|__|     \|__|\|_______|\|__|\|__|\|_______|\|_______|\|__| \|__|
    </pre>
    <pre>{{intro}}</pre>
    <pre v-for="(stdout, index) in histories" :key="index">{{stdout}}</pre>
    <form @submit.prevent="enterCommand(command)" >
      <pre class="flex"><span>{{prompt}}</span> <input ref="terminal" type="text" :placeholder="helpText" class="flex-1 bg-gray-900 focus:outline-none ml-2" autofocus v-model="command"/></pre> 
    </form>
  </div>
</template>

<script>
const googleSkillBadges = 'https://www.cloudskillsboost.google/public_profiles/77a9cde5-cfa2-4ff2-9f33-5d3b57c2ba61'
export default {
  data() {
    return {
      prompt: 'nuttakorn@gnomestudio ➜  ~ ',
      intro: `Last login: ${new Date()} on ttys001`,
      helpText: `type help to list all available commands...`,
      histories: [],
      command: '',
      workDirectory: '/',
      commands: {
        help: {
          name: 'help',
          description: "list all available commands",
          execute: () => {
            this.histories.push(`This is all available commands.`)
            for(let command in this.commands) {
              this.histories.push(`${this.commands[command].name} \t\t => ${this.commands[command].description}`)
            }
          }
        },
        clear: {
          name: 'clear',
          description: `clear the terminal screen`,
          execute: () => {
            this.histories = []
          }
        },
        ls: {
          name: 'ls   ',
          description: `list directory contents`,
          execute: async () => {
            // Using a unique key for useAsyncData to avoid caching issues between different directories
            const { data, error } = await useAsyncData(`ls-execute-${this.workDirectory}`, () => queryContent(this.workDirectory).find());

            if (error.value) {
              this.histories.push(`ls: cannot access '${this.workDirectory}': No such file or directory`);
              return;
            }

            if (!data.value) {
                return;
            }

            if (data.value.length === 1 && data.value[0].path === this.workDirectory) {
                const item = data.value[0];
                this.histories.push(item.slug + item.extension);
                return;
            }

            const entries = new Set();
            const workDir = this.workDirectory;

            data.value.forEach(item => {
              if (item.dir === workDir) {
                entries.add(item.slug + item.extension);
              } else if (item.dir.startsWith(workDir)) {
                const dirPrefix = workDir === '/' ? '' : workDir;
                const relativeDir = item.dir.substring(dirPrefix.length + 1);
                const subdirectory = relativeDir.split('/')[0];
                if (subdirectory) {
                  entries.add(subdirectory + '/');
                }
              }
            });

            Array.from(entries).sort().forEach(entry => {
              this.histories.push(entry);
            });
          }
        },
        cd: {
          name: 'cd   ',
          description: 'change directory',
          execute: async (arg) => {
            if (!arg || arg === '~') {
              this.workDirectory = '/'
              return
            }

            if (arg === '..') {
              if (this.workDirectory === '/') return;
              const parts = this.workDirectory.split('/').filter(p => p)
              parts.pop()
              this.workDirectory = '/' + parts.join('/')
              if (this.workDirectory === '') this.workDirectory = '/'
              return
            }

            // Path building
            let newPath;
            if (arg.startsWith('/')) {
              newPath = arg;
            } else {
              newPath = this.workDirectory === '/' ? `/${arg}` : `${this.workDirectory}/${arg}`
            }

            // Check if newPath is a file by trying to findOne()
            const { data: fileData } = await useAsyncData(`file-${newPath}`, () => queryContent(newPath).findOne());
            if (fileData.value && fileData.value.dir !== newPath) { // It's a file
                this.histories.push(`cd: not a directory: ${arg}`);
                return;
            }

            // Check if newPath is a directory by finding content inside it
            const { data: dirData, error } = await useAsyncData(`dir-${newPath}`, () => queryContent(newPath).find());

            if (error.value || !dirData.value || dirData.value.length === 0) {
              this.histories.push(`cd: no such file or directory: ${arg}`);
              return;
            }

            // It seems to be a directory.
            // Clean up path, removing trailing slashes
            this.workDirectory = newPath.replace(/\/$/, '') || '/';
          }
        },
        pwd: {
          name: 'pwd  ',
          description: 'print working directory',
          execute: () => {
            this.histories.push(this.workDirectory)
          }
        },
        cat: {
          name: 'cat  ',
          description: `concatenate and print files`,
          execute: async (arg) => {
            if (!arg) {
              this.histories.push('usage: cat [file]');
              return;
            }

            if (!arg.endsWith('.md')) {
              this.histories.push(`cat: ${arg}: is a directory or not a text file`);
              return;
            }

            let path;
            if (arg.startsWith('/')) {
              path = arg;
            } else {
              path = this.workDirectory === '/' ? `/${arg}` : `${this.workDirectory}/${arg}`
            }

            const { data, error } = await useAsyncData(path, () => queryContent(path.replace('.md', '')).findOne());

            if (error.value || !data.value) {
                this.histories.push(`cat: ${arg}: No such file or directory`);
                return;
            }

            if (data.value.children) {
                this.histories.push(`cat: ${arg}: is a directory`);
                return;
            }

            if (data.value) {
              this.histories.push(JSON.stringify(data.value, null, 2));
            } else {
              this.histories.push(`cat: ${arg}: file not found`);
                    }
                  }
                },
        sh: {
          name: 'sh   ',
          description: `run shell script`,
          execute: () => {

          }
        },
        open: {
          name: 'open ',
          description: `open link`,
          execute: () => {

          }
        }
      },
    }
  },
  methods: {
    enterCommand(command) {
      this.histories.push(`${this.prompt} ${command}`)
      this.executeCommand(command)
      this.command = ''
      window.scrollTo(0, document.body.scrollHeight);
    },
    executeCommand(command) {
      if(!command) return
      let c = command.split(' ')[0]
      let arg = command.split(' ')[1]
      if(this.commands[c]) {
        this.commands[c].execute(arg)
      }else{
        this.histories.push(`command not found: ${c}`)
      }
    }
  },
  mounted() {
    this._keyListener = (e) => {
      if(e.key === 'l' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        this.histories = []
      }
    }
    
    document.addEventListener('keyDown', this._keyListener.bind(this))
  },
  beforeDestroy() {
      document.removeEventListener('keydown', this._keyListener);
  }
}
</script>
