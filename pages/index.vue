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
      workDirectory: '/home/nuttakorn',
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
          execute: () => {
            for(let dir in this.directory) {
              this.histories.push(dir)
            }
          }
        },
        cd: {
          name: 'cd   ',
          description: 'change directory',
          execute: () => {

          }
        },
        pwd: {
          name: 'pwd  ',
          description: 'print working directory',
          execute: () => {

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

    if (!this.directory[arg]) {
      this.histories.push(`cat: ${arg}: No such file or directory`);
      return;
    }

    if (!arg.endsWith('.md')) {
      this.histories.push(`cat: ${arg}: is a directory or not a text file`);
      return;
    }

    const path = '/' + arg.replace('.md', '');
    const { data, error } = await useAsyncData(path, () => queryContent(path).findOne());

    if (error.value) {
        this.histories.push(`cat: ${arg}: ${error.value}`);
        return;
    }

    if (data.value) {
      // It seems that the content is in the body, but it is an object not a string.
      // So I will loop through the body children to get the value out from it.
              this.histories.push(JSON.stringify(data.value.body.children, null, 2));
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
      directory: {
        "about.md": {},
        blog: {},
        projects : {},
        "contactme.sh": {}
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
