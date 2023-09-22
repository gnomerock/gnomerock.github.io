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
            if(arg === 'about.md') {
              console.log('good job')
              const { data } = await useAsyncData('about', () => queryContent('/about').findOne())
              console.log({data})
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
  mounted() [
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
