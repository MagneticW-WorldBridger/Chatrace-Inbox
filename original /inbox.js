
var listenCFSuggestion = true;
var all_cf_suggestion = get_system_fields(); 
var cdts = [];

importCondition(false, true);
// CONSTANTS
var channels = [
	{ id: "0", name: "Messenger", icon: "fab fa-facebook-messenger", color: "#0084ff", disabled: false, maxDays: 168, maxDaysMessage: myi18n.tc('i.msg2', 7), sendFile: true, sendVoice: true, sendImage: true, acceptFile: '*/*'},
	{ id: "10", name: "Instagram", icon: "fab fa-instagram", color: "#833AB4", disabled: false, maxDays: 168, maxDaysMessage: myi18n.tc('i.msg2', 7), sendFile: false, sendVoice: true, sendImage: true, acceptFile: 'image/*'},
	{ id: "5", name: "Whatsapp", icon: "fab fa-whatsapp", color: "#075e54", disabled: false, maxDays: 24, maxDaysMessage: myi18n.t('i.msg3'), requirePhone: true, sendFile: true, sendVoice: true, sendImage: true, acceptFile: '*/*'},
	{ id: "7", name: "Google BM", icon: "fab fa-google", color: "#ea4335", disabled: false, maxDays: 30*24, maxDaysMessage: myi18n.tc('i.msg2', 30), sendFile: false, sendVoice: false,  sendImage: true, acceptFile: 'image/*'},
	{ id: "9", name: "Webchat", icon: "fal fa-globe", color: "#333", disabled: false, sendFile: true, sendVoice: true, sendImage: true, acceptFile: '*/*'},
	{ id: "2", name: "SMS", icon: "fas fa-sms", color: "#FFA900", disabled: false, requirePhone: true, sendFile: false, sendVoice: false, sendImage: true, acceptFile: 'image/*'},
	{ id: "8", name: "Telegram", icon: "fab fa-telegram", color: "#0088cc", disabled: false, sendFile: true, sendVoice: true, sendImage: true, acceptFile: '*/*'},
	{ id: "12", name: "Viber", icon: "fa-brands fa-viber", color: "#7360F2", disabled: false, sendFile: true, sendVoice: false, sendImage: true, acceptFile: '*/*'},
	{ id: "15", name: "Voice", icon: "fa-solid fa-circle-phone", color: "#6C88C4", disabled: false, sendFile: false, sendVoice: false, sendImage: false, acceptFile: '*/*'},
	{ id: "16", name: "Viber BM", icon: "fa-brands fa-viber", color: "red", disabled: false, sendFile: false, sendVoice: false, sendImage: true, acceptFile: 'image/*'},	
	//{ id: "11", name: "RCS", icon: "fal fa-comment-plus", color: "#888", requirePhone: true, sendFile: true, acceptFile: '*/*', sendImage: true},
];

var ntfcSupported = ("Notification" in window);

var userChannels = cloneObj(channels);

function getChannelById(id)
{
	for(var i = 0; i < channels.length; i++)
	{
		if(id == channels[i].id)
			return channels[i];
	}

	return {};
}

var responsiveBreak = 768;

// VUE OBJECT
var app = null;
var webchat = false;

// WEBSOCKET OBJECT
var ws = null;

// FROM INFO
var dir = 0;
var sentBy = 0;

// PAGE OBJECT
var pageId = null;
var lastChatHeight = 0;

function logged(){
    pb_show(false);
    
    pageId = cur_page.page_id;
    sentBy = my_perm.fb_id;
	

	let itv = setInterval(function () {
        if(app){ 
			tryConnect();
            clearInterval(itv);
            app.reloadChats();
        }        
    }, 20);
}


$(document).ready(function(){
	let chatMode = window.innerWidth >= responsiveBreak ? 'desktop' : 'list'
	// VUE JS
	// ANCHOR VUE START
	app = new Vue({
		el: '#app2',
		i18n: myi18n,
		components: myComponets,
		data: {
			viewActions: false,
			userRenameP: false,
			editField:{active: false, value: null, item: null, search:'', chooseCF: {active: false, name: '', type: '0', step:"select"}},
			connecting: false,
			swimlines: [],
			swimLineInfo: {},
			data: mainData,
			sendType: 'text', //text | file
			sendingFile: false,
			message: '',
			files: [],
			fileList: [],
			messageComposer: false,
			chatMode: chatMode, // list, chat, info

			devMode: false && window.location.href.includes("localhost"),
			recording: false,
			mediaRecorder: null,
			searchText: "",
			filters: {visible: false, channel: '-1', job: '-1', assigned_to: '-1', archived:'0', others: []},
			activeChat: null,
			activeChatInfo: null,
			user: null,
			loadingChatInfo: false,
			selectedSendChannel: channels[0],
			searchAdmin: '',
			ecommerceSettings: null,
			products:null,
			calendars: null,
			newAppointment: {calendarID: null, link: ''},
			tags: null,
			customFields: null,
			sequences: null,
			otns: null,
			jobs: null,
			gbmLocations:null,
			waTemplateNames: null,
			waTemplates: null,
			admins: [],
			teams: [],
			adminsTeams: [],
			newNote: {active: false, id: null, text: ''},
			newSavedReply: {active: false, id: null, shortcode: '', value: ''},
			savedReplyVisible: false,
			assignConvV: false,
			chats: [],
			chatPage: 0,
			chatLimit: 50,
			loadingChats: false,
			chatFolder: getCookies("ibxChatFolder", "-1"),
			showChatFolder: true,			
			selectedJob: '0',
			findLimit: false,
			chatChannel: null,
			lastMessage: null,
			loadingMessages: false,
			activeChatMessages: [],
			replyingTo: null,
			userComments: [],
			userRefs: [],
			userInboxActions:[],
			userAppointments: null,
			messagePage: 0,
			messageLimit: 20,
			findMessageLimit: false,
			sendContent: null,
			flow: null,
			stepID: '',
			pageFlows: [],
			savedReplies: [],
			savedRepliesSearch:"",
			triggeSRonFocus: false,
			search: '',
			showBttAskNtfc: ntfcSupported && Notification.permission === 'default',
			dialogPreviewFile:{visible: false, type: 'image', url:''}
		},

		mounted() {

			$('#chat-user-list').on('scroll', function() {
				var l = 200;
		        if($(this).scrollTop() + $(this).innerHeight() + l >= $(this)[0].scrollHeight)
		        {
		            app.loadChats(false);
		        }

		    });

			this.$nextTick(function () {
                cf_enable_suggestions('.myvue .cf_suggestions', all_cf_suggestion);
                emojiEvents();
            });
		},

		updated: function () {	
			lastVueUpdated = getTimestamp(true);
            this.$nextTick(function () {  
                setTimeout(() => {
                    if(getTimestamp(true) - lastVueUpdated >= 700){
						lastVueUpdated =getTimestamp(true); 
						cf_enable_suggestions('.myvue .cf_suggestions', all_cf_suggestion);
						emojiEvents('.myvue');
                    }
                }, 700);
            }) 
		},

		methods: {
			enableSendText(){
				this.sendType = 'text';
			},
			fileChanged(file){
				if(file){
					if(file.size < 26214400){
						fileSelected(file.raw);
					}else{
						this.$refs.uploadFile.clearFiles();
						msg_error("This file is bigger than 25MB");
					}
				}				
			},
			waFileChanged(file){
				if(file){
					if(file.size < 26214400){
						this.sendContent.loading = true;
						param = {page_id: cur_page.page_id, op : 'flows', op1:'upload', op2: getFileType(file.raw.type), file_name: file.name, uploadFB: false, inbox: true, ms_id: app.activeChat.ms_id}
						upload_file(null, file.raw, file.raw, param, null, function(data){
							if(data.status === 'OK'){
								app.sendContent.waTemplate.template.components.header.url = data.url;
								app.sendContent.waTemplate.template.components.header.fileName = data.fileName;
								app.sendContent.isReady = isWaTemplateReady(app.sendContent.waTemplate.template.components);
							}else{

							}

							app.sendContent.loading = false;
						})

					}else{
						this.$refs.uploadFileWA.clearFiles();
						msg_error("This file is bigger than 25MB");
					}
				}				
			}
			,querySearch(queryString, cb) {
              var results = queryString ? this.savedReplies.filter(this.createFilter(queryString)) : this.savedReplies;
              cb(results);
            },
            createFilter(queryString) {
				
              return (link) => {
                return (link.shortcode.toLowerCase().indexOf(queryString.toLowerCase()) === 0);
              };
            },
            handleSelect(item) {

            },triggerSavedReplies(){
				this.message = '';
				this.triggeSRonFocus = true;
				setTimeout(() => {
					$(".chat-input .el-textarea__inner").focus();
				}, 500);
			},


			selectReplyEdit(item){
				this.message = item.value;
				this.savedReplyVisible = false;
			},
			savedReplyEdit(item){
				this.newSavedReply = {active: true, id: item.id, shortcode: item.shortcode, value:item.value}
			},
			savedReplySave(){
				let param = {page_id: cur_page.page_id, op: 'inbox_saved_reply', op1: 'update', data: this.newSavedReply}

				execute_request(param, null, null, false, function (r) {                
					if (r.status == "OK"){
						if(r.affected){
							if(!app.newSavedReply.id)
								app.savedReplies.push(r.data);
							else{
								let index = arrayGetIndex(app.savedReplies, app.newSavedReply.id);
								app.savedReplies[index] = r.data;
							}								
						}						

						app.savedReplyCancel();
					}else
						msg_error();
				});
			},			
			savedReplyCancel(){
				this.newSavedReply = {active: false, id: null, shortcode: '', value: ''}
			},
			savedReplyDelete(item, index){	
				show_model(true, myi18n.tc('msg2')+ ' '+myi18n.t('msg3'), myi18n.t('delete'), myi18n.t('cancel'), "");
                $("#btt_yes").click(function () {
                    let param = {page_id: cur_page.page_id, op: 'inbox_saved_reply', op1: 'delete', id: item.id}
					execute_request(param, null, null, false, function (r) {                
						if (r.status == "OK"){
							app.savedReplies.splice(index, 1); 
						}else
							msg_error();
					});
                }); 	
			},






			noteEdit(item){
				this.newNote = {active: true, id: item.id, text: item.text}
			},
			noteSave(){
				let param = {page_id: cur_page.page_id, ms_id: this.activeChat.ms_id, op: 'users', op1: 'notes', op2: 'update', data: this.newNote}

				execute_request(param, null, null, false, function (r) {                
					if (r.status == "OK"){
						if(r.affected){
							if(!app.newNote.id)
								app.activeChatInfo.notes.push(	r.data);
							else{
								let index = arrayGetIndex(app.activeChatInfo.notes, app.newNote.id);
								app.activeChatInfo.notes[index] = r.data;
							}								
						}						

						app.noteCancel();
					}else
						msg_error();
				});
			},			
			noteCancel(){
				this.newNote = {active: false, id: null, text: ''}
			},
			noteDelete(item, index){	
				show_model(true, myi18n.tc('msg2')+ ' '+myi18n.t('msg3'), myi18n.t('delete'), myi18n.t('cancel'), "");
                $("#btt_yes").click(function () {
                    let param = {page_id: cur_page.page_id, ms_id: app.activeChat.ms_id, op: 'users', op1: 'notes', op2: 'delete', id: item.id}
					execute_request(param, null, null, false, function (r) {                
						if (r.status == "OK"){
							app.activeChatInfo.notes.splice(index, 1); 
						}else
							msg_error();
					});
                }); 	
			},


			windowScroll: function(p)
			{
				setTimeout(function(){
					$('html, body').scrollTop(p);
				}, 250);
			},


			loadChats: function(selectFirstChat) {
				if(selectFirstChat === undefined)
					selectFirstChat = true;

				if(this.loadingChats || this.findLimit)
					return;

				this.loadingChats = true;

				let mainCdts = [];
				if(app.searchText){
					let searchText = app.searchText.replaceAll(" ", '').replaceAll("(", '').replaceAll(")", '');

					if(!isNaN(searchText)){
						mainCdts.push({ atrb_name: 'phone', oprt: '6', value1: [searchText], value2: null, order: 1});
					}else if(searchText.includes('@')){
						mainCdts.push({ atrb_name: 'email', oprt: '6', value1: [searchText], value2: null, order: 1});
					}else{
						mainCdts.push({ atrb_name: 'user_name',oprt: '6', value1: [app.searchText], value2: null, order: 1});
					}

					app.showChatFolder = false;
				}else{ 
					app.showChatFolder = true;
					if(app.chatFolder != -1)
						mainCdts.push({ atrb_name: 'live_chat', oprt: '0', value1: app.chatFolder, value2: null, order: 0 });
				}
				
				
				if(app.filters.assigned_to != -1)
					mainCdts.push({atrb_name: 'assigned_to', oprt: '0', value1: [app.filters.assigned_to], value2: null, order: 0});

				if(app.filters.channel != -1)
					mainCdts.push({atrb_name: 'channel', oprt: '0', value1: [app.filters.channel], value2: null, order: 0});


				if(app.filters.job > 0)
					mainCdts.push({atrb_name: 'jobs', oprt: '0', value1: [app.filters.job], value2: null, order: 2});

				if(app.filters.others.includes("unread"))
					mainCdts.push({atrb_name: 'unread', oprt: '0', value1: 0, value2: null, order: 0});

				if(app.filters.others.includes("followup"))
					mainCdts.push({atrb_name: 'followup', oprt: '0', value1: 0, value2: null, order: 0});

				if(app.filters.others.includes("no_reply"))
					mainCdts.push({atrb_name: 'no_reply', oprt: '0', value1: 0, value2: null, order: 0});

				
				mainCdts.push({atrb_name: 'archived', oprt: '0', value1: app.filters.others.includes("archived") ? 0 : 1, value2: null, order: 0});
				mainCdts.push({atrb_name: 'blocked', oprt: '0', value1: app.filters.others.includes("blocked") ? 0 : 1, value2: null, order: 0});
					
				Array.prototype.push.apply(mainCdts, cdts); 

				// params
				var param = [];
				param.push({
					page_id: cur_page.page_id,
					op: "conversations", op1 :
					'get', offset: app.chatPage,
					limit: app.chatLimit,
					cdts: mainCdts,
					fixLiveChat: mainData.cur_page.num_live_chat
				});

				execute_request(param, null, null, false, function (json) {                
					if (json[0].status == "OK")
					{
						mainData.cur_page.num_live_chat = json[0].num_live_chat;
						app.chats = app.chats.concat(json[0].data);
						app.loadingChats = false;

						if(selectFirstChat && $.urlParam("id"))
							app.selectUserFromQuery($.urlParam("id"));
						else if(selectFirstChat && app.chatPage == 0 && app.chats.length > 0 && app.chatMode == "desktop")
							app.selectChat(app.chats[0]);

						if(json[0].data.length <= 0)
							app.findLimit = true;
						else
							app.chatPage += app.chatLimit;

						setTimeout(function(){
							app.windowScroll(0);
						}, 500);
					}
				});

			},

			reloadChats: function() {

				this.chats = [];
				this.chatPage = 0;
				this.findLimit = false;
				this.loadChats();

			},

			scrollToChatList: function() {
				if(window.innerWidth < responsiveBreak)
					app.chatMode = "list";
				else
					app.chatMode = "desktop";
			},

			scrollToChat: function() {
				if(window.innerWidth < responsiveBreak)
					app.chatMode = "chat";
				else
					app.chatMode = "desktop";
			},

			scrollToUserInfo: function() {
				if(window.innerWidth < responsiveBreak)
				{
					//app.windowScroll(2 * window.innerHeight);
					app.chatMode = "info";
				}
				else
					app.chatMode = "desktop";
			},

			selectChat: function(c) {

				// ANCHOR SET QUERY ON URL

				if(window.innerWidth < responsiveBreak)
				{
					app.windowScroll(window.innerHeight);
					app.chatMode = "chat";
				}

				if(this.activeChat === c)
					return;

				
				this.activeChat = c;
				

				if(c.timestamp/1000 > c.last_read_page)
					this.markAsRead(true)

				this.sendType = 'text';
				this.files = [];
				this.message = '',
				this.sendingFile = false;
				app.lastMessage = null;
				this.reloadMessage();
				this.activeChatInfo = {};
				
				app.canSendMessage();

				// params
				var param = [];
				param.push({page_id: cur_page.page_id, op: "users", op1 : 'get', ms_id: c.ms_id});
				if(app.tags === null){
					param.push({page_id: cur_page.page_id, op: "tags", op1 : 'get' });
					param.push({page_id: cur_page.page_id, op: "custom-fields", op1 : 'get' });
					param.push({page_id: cur_page.page_id, op: "sequences", op1 : 'get' });
					param.push({page_id: cur_page.page_id, op: "otn", op1 : 'get' });
					param.push({page_id: cur_page.page_id, op: "inbox_saved_reply", op1 : 'get' });
					param.push({page_id: cur_page.page_id, op: "admins", op1 : 'get', basic_info: true });
					param.push({page_id: cur_page.page_id, op: "flows", op1 : 'get'});					
					param.push({page_id: cur_page.page_id, op: "jobs", op1 : 'get' });
					param.push({page_id: cur_page.page_id, op: "googleBM", op1 : 'location', op2:'get' });
					param.push({page_id: cur_page.page_id, op: "inbox_team", op1:'get' });					
				}
				

				app.loadingChatInfo = true;
				execute_request(param, null, null, false, function (json) {

					if (json[0].status == "OK")
					{
						userChannels = getActiveChannels(json[0].data);
						if(!app.lastMessage)
							app.selectChatSendChannel(userChannels[0]);

						if(!app.custom_fields)
							app.custom_fields = json[2].results;

						let results = json[0].data.custom_fields;
						let cfNoValue = [];

						

						if(app.custom_fields.length > 0){	
							let hasValue, cf;
							for(let i = 0; i < app.custom_fields.length; i++){ 
								cf = app.custom_fields[i]; 
								if(cf.botfield == 1)
									continue;				
							   
								hasValue = false;
				
								for(x in results){
									if(cf.id == results[x].id){
										results[x].name = cf.name;
										results[x].formatedValue = cf_value(results[x].type, results[x].value, true);
										results[x].editing = false;
										hasValue = true; 
										break;
									}
								}
				
				
								if(!hasValue)								
									cfNoValue.push(cf);		
							}

							//order custom fields by name
							for(let i = 0; i < results.length; i++){
								for(let j = 0; j < results.length; j++){
									if(i > j && results[i].name !== undefined && results[i].name.localeCompare(results[j].name) < 0){
										let r = cloneObj(results[i]);
										results[i] = cloneObj( results[j])
										results[j] = r;
									}
									
								}
							}

							
						}
						
						let user = json[0].data, locaLtime = null;
						
						if(user.timezoneName !== ''){
							let time = moment().tz(user.timezoneName)
							if(time && time._z)
								locaLtime = time.format('HH:mm');
						}

						if(!locaLtime)
							locaLtime = UTC_to_local_strdate(moment.utc(), 'HH:mm', user.timezone * 60);

						let userSystemFields = [{id: -12, name: myi18n.t('emailAddress'), value: user.email, formatedValue: user.email !== '' ? user.email : '---- '+myi18n.t('edit')+' ----',  type: -1, editing: false},
						{id: -8, name: myi18n.t('phoneNumber'), value: user.phone, formatedValue: user.phone !== '' ? user.phone : '---- '+myi18n.t('edit')+' ----',  type: -1, editing: false, hint:'+123456789'},
						{icon:'fa-thin fa-clock', name: myi18n.t('localTime'), value: locaLtime, formatedValue: locaLtime,  type: -1, editing: false},
						{icon:'fa-thin fa-address-book', name: myi18n.t('Contact'), value: UTC_to_local_strdate(user.dt), formatedValue: UTC_to_local_strdate(user.dt),  type: -1, editing: false}];

						if(user.gender != 2)
							userSystemFields.push({icon: user.gender == 0 ? 'fa-thin fa-person-dress-simple' : 'fa-thin fa-person' , name: myi18n.t('gender'), value: user.gender, formatedValue: gender_tostring(user.gender), type: -1, editing: false})
						
						if(whitelabel.lt)
							userSystemFields.splice(2, 0, {id: -62, icon: 'fa-thin fa-heart' , name: 'Terra Coins', value: user.custom2, formatedValue: user.custom2, type: -1, editing: false})
						
						
						if(user.country != 0)
							userSystemFields.push({id: -54, name: myi18n.t('e.country'), value: user.country, formatedValue: getItemName(allCountries, user.country, ['i', 'n']), type: -1, editing: null});

						if(user.state)
							userSystemFields.push({id: -55, name: myi18n.t('e.state'), value: user.state, formatedValue: usState[user.state], type: -1, editing: null});
							
						if(user.city)
							userSystemFields.push({id: -56, name: myi18n.t('e.city'), value: user.city, type: -1, editing: null});

						if(user.zip && false)
							userSystemFields.push({id: -56, name: myi18n.t('e.zip'), value: user.zip, type: -1, editing: null});
						

						json[0].data.custom_fields = userSystemFields.concat(results);
						json[0].data.customFieldsNovalue = cfNoValue;
						
					}


					//check if the first time inbox is loaded
					if(app.tags === null){
						if (json[1].status == "OK")
							app.tags = json[1].results;
	
						if (json[2].status == "OK"){	
							app.customFields = json[2].results;
							for(var i = 0; i < app.customFields.length; i++)
								all_cf_suggestion.push({name: app.customFields[i].name, value:'{'+app.customFields[i].name+'}}'}); 
						}
	
						if (json[3].status == "OK")
							app.sequences = json[3].results;
	
						if (json[4].status == "OK")
							app.otns = json[4].results;

						if (json[5].status == "OK")
							app.savedReplies = json[5].results;

						if (json[6].status == "OK")
							app.admins = json[6].results;

						if(json[7].status == "OK")
							app.pageFlows = json[7].results;

						if (json[8].status == "OK"){
							app.jobs = json[8].results;
							if(app.jobs.length){
								app.swimline = {};
								for(let j = 0; j < app.jobs.length; j++){
									for(let i = 0; i < app.jobs[j].data.steps.length; i++)
										app.swimline['i'+app.jobs[j].data.steps[i].id] = app.jobs[j].data.steps[i].name;
								}
							}
						}

						app.gbmLocations = json[9].results;

						if(json[10].status == "OK")
							app.teams = json[10].data;

						
						for(let i = 0; i < app.admins.length; i++)
							app.adminsTeams.push({id: app.admins[i].fb_id, name: app.admins[i].name, profile_pic: app.admins[i].profile_pic, isTeam: false});
						
						for(let i = 0; i < app.teams.length; i++)
							app.adminsTeams.push({id: app.teams[i].id, name: app.teams[i].name, profile_pic: whitelabel.appdomain+'images/peopleGroup.svg', isTeam: true});
					}

					if(app.jobs && app.jobs.length  > 0){
						let useSwimLine = false;
						let swimlines = []; let options = [];
						for(let i = 0; i < app.jobs.length; i++){
							let job = app.jobs[i];
							let option = {value: job.id, label: job.name}
							option.children = [{value: 0, label: "All Candidates"}];
							option.disabled = true;

							if(job.data.steps.length){	
								useSwimLine = true;							
								for(let j = 0; j < job.data.steps.length; j++){
									let step = job.data.steps[j];
									option.children.push({value: step.id, label: step.name});
								}

							}else{

							}

							options.push(option);
						}

						value = []; json[0].data.swimlines;
						if(json[0].data.swimlines){
							for(let i = 0; i < json[0].data.swimlines.length; i++)
								value.push([json[0].data.swimlines[i].job, Number(json[0].data.swimlines[i].id)]);

							swimlines.push({value: value, data: options});
							app.swimLineInfo = {isMultiple: true, lastValue: value, useSwimLine};
							json[0].data.swimlines = swimlines;
						}
					}



					app.activeChatInfo = json[0].data;
					app.loadingChatInfo = false;
					app.canSendMessage();	
					
					
					// send to socket
					if(ws && ws.readyState == 1){
						ws.send(JSON.stringify({
							action: -1,
							data: {
								dir: dir, // 0 = out, 1 = in
								from: sentBy,
								channel: app.activeChat.channel,
								page_id: pageId,
								ms_id: app.activeChat.ms_id,
								hash: app.activeChatInfo.hash
							}
							
						}));
					}
					
				});

				

				setTimeout(function() {
					$('.chat-area').off('scroll').on('scroll', function() {
						if($(this).scrollTop() <= 0)
							app.loadMessage();
			
					});
				}, 1000);
				
			},

			addTag: function(t)
			{
				if(app.activeChatInfo.tags.length > 0)
				{
					var l = app.activeChatInfo.tags.length - 1;
					var e = app.activeChatInfo.tags[l];

					var find_id = false;
					for(var i = 0; i < app.tags.length; i++)
					{
						if(app.tags[i].id == e)						
							find_id = true;
					}

					var param = [];
					param.push({ page_id: cur_page.page_id, op: "users", op1 : 'update', op2: "add-tag", tags: [find_id ? Number(e) : e], psid: [app.activeChat.ms_id]});

					execute_request(param, null, null, false, function (json) {
						if (json[0].status == "OK"){}						
					});
				}
			},

			removeTag: function(id)
			{
				app.removeElements('tags', id);
			},


			removeSequence: function(id)
			{
				app.removeElements('sequences', id);
			},

			changeSequence: function()
			{
				if(app.activeChatInfo.sequences.length > 0)
				{
					var l = app.activeChatInfo.sequences.length - 1;
					var e = app.activeChatInfo.sequences[l];

					var param = [];
					param.push({page_id: cur_page.page_id, op: "users", op1 : 'update', op2: "add-sequence", sequence: [e], psid: [app.activeChat.ms_id]});

					execute_request(param, null, null, false, function (json) {
						if (json[0].status == "OK")
						{
							
						}						
					});
				}
			},
			removeJob: function(id)
			{
				app.removeElements('jobs', id);
			},

			changeJob: function()
			{
				if(app.activeChatInfo.jobs.length > 0)
				{
					var l = app.activeChatInfo.jobs.length - 1;
					var e = app.activeChatInfo.jobs[l];

					var param = [];
					param.push({page_id: cur_page.page_id, op: "users", op1 : 'update', op2: "jobs", op3: 'add', data: {id: e}, psid: [app.activeChat.ms_id]});

					execute_request(param, null, null, false, function (json) {
						if (json[0].status == "OK"){}						
					});
				}
			},


			removeOTN: function(id)
			{
				app.removeElements('otns', id);
			},

			removeElements: function (context, id)
			{
				let param;
				if(context == "sequences")
					param = { page_id: cur_page.page_id, op: "users", op1 : 'update', op2: "remove-sequence", sequence: [id], psid: [app.activeChat.ms_id]};
				else if(context == "tags")
					param = {page_id: cur_page.page_id, op: "users",	op1 : 'update', op2: "remove-tag", tags: [id], psid: [app.activeChat.ms_id]};
				else if(context == "otns")
					param = { page_id: cur_page.page_id, op: "users", op1 : 'update', op2: "remove-otn", tags: [id], psid: [app.activeChat.ms_id]};
				else if(context == 'jobs')
					param = {page_id: cur_page.page_id, op: "users", op1 : 'update', op2: "jobs", op3: 'delete', data: {id: id}, psid: [app.activeChat.ms_id]};
				

				execute_request(param, null, null, false, function (data) {
					if (data.status != "OK"){

					}						
				});

			},

			selectChatSendChannel: function(c) {
				app.selectedSendChannel = c;
			},

			inputSendHandler(e){
				if (e.keyCode === 13 && !e.shiftKey) {
					e.preventDefault();
					this.sendMessage();
				}
			},
			setRelyingTo(id, message){
				if(!id)
					id = message.id;

				let data = {'text': '...', type: 'text'}
				if(message.wa){
					if(message.type == 'text')
						data.text = message.text.body;
				}else if(message.text)
					data.text = message.text;
				else if(message.attachment){
					let att = message.attachment;
					data.type = att.type;
					data.url = att.payload.url;
				}


				this.replyingTo = {id, data}
			},sendMessage: function() {
				if(!app.canSendMessage())
				{
					app.$message({
						message: app.selectedSendChannel.maxDaysMessage,
						type: 'warning'
					});
					return;
				}

				if(this.recording){
					this.finishRecording();
					return
				}

				if(this.activeChat.live_chat == 0)
					this.moveToOtherFolder(true);

				var content = {
					action: 0,

					data: {
						dir: dir, // 0 = out, 1 = in
						from: sentBy,
						fromInbox: true,
						channel: Number(this.selectedSendChannel.id),
						page_id: pageId,
						ms_id: this.activeChat.ms_id,
						hash: app.activeChatInfo.hash,
						timestamp: new Date().getTime()
					}
				};


				if(this.sendType == 'text'){
					if(!this.message === '')
						return;

					let message = {type: 'text', text: this.message, dir: dir, channel: Number(this.selectedSendChannel.id), from: sentBy}
					if(this.replyingTo){
						message.replyingTo = this.replyingTo.id;
						this.replyingTo = null;
					}
						
					content.data.message = [message]
					

					if(ws.readyState == 1)
						ws.send(JSON.stringify(content));

					app.activeChat.last_active = getTimestamp();

					this.message = "";


					

					
				}else{
					let file = this.files[0].file, fileType;
					
					if(this.files[0].type)
						fileType = this.files[0].type;
					else{
						fileType = file.type;
						if(fileType.includes('image'))
							fileType = 'image';
						else if(fileType.includes('audio'))
							fileType = 'audio';
						else if(fileType.includes('video'))
							fileType = 'video';
						else
							fileType = 'file';
					}
					
					

					app.sendType = 'text';
					app.files = [];					
					app.sendingFile = true;


					if(fileType == 'image' && file.type !== 'image/gif'){
						loadImage(
							file,
							function (canvas_img) {  
								param = {op : 'flows', op1:'upload', op2:'image', file_name:null, uploadFB: false, inbox: true, ms_id: app.activeChat.ms_id}
								upload_file('imageCanvas', canvas_img, file, param, null, function(r){
									if(r.status === 'OK'){  
										let message = {type: 'file', attachment: {type: fileType, payload: {url : r.url}}, file:{url: r.url, name: param.file_name, length: file.size, type: fileType}, dir: dir, channel: Number(app.selectedSendChannel.id), from: sentBy}
										content.data.message = [message]
										if(this.replyingTo){
											message.replyingTo = this.replyingTo.id;
											this.replyingTo = null;
										}

										if(ws.readyState == 1){
											ws.send(JSON.stringify(content));
											app.activeChat.last_active = getTimestamp();
											app.activeChat.timestamp = app.activeChat.last_active * 1000;
											app.activeChat.t_last_sent = app.activeChat.timestamp;
										}
										
									}else
										;
								});
							},{maxWidth: 1200, canvas: true}
						);
					}else{
						param = {page_id: cur_page.page_id, op : 'flows', op1:'upload', op2: fileType, file_name: file.name, uploadFB: false, inbox: true, ms_id: app.activeChat.ms_id}
						upload_file(fileType, file, file, param, null, function(r){
							app.sendingFile =  false;
							if(r.status === 'OK'){  
								content.data.message = [{type: 'file', attachment: {type: fileType, payload: {url : r.url}}, file:{url: r.url, name: param.file_name, length: file.size, type: fileType}, dir: dir, channel: Number(app.selectedSendChannel.id), from: sentBy}]
								if(ws.readyState == 1){
									ws.send(JSON.stringify(content));
									app.activeChat.last_active = getTimestamp();
									app.activeChat.timestamp = app.activeChat.last_active * 1000;
									app.activeChat.t_last_sent = app.activeChat.timestamp;
								}
							}else
							;
						});
					}
				}
			},

			unSelectChat: function(){
				app.activeChat = null;
				app.activeChatInfo = null;
			},
			changeChatFolder: function() {
				setCookies("ibxChatFolder", app.chatFolder);
				app.unSelectChat();
				app.reloadChats();
			},

			changeChatChannel: function(c) {
				app.chatChannel = c;
				app.reloadChats();
			},

			loadMessage: function() {
				if(cur_page.plan == 4)
					return;

				if(this.loadingMessages || this.findMessageLimit)
					return;

				this.loadingMessages = true;

				

				// ANCHOR GET MESSAGES
				// params
				var param = [];
				param.push({id: app.activeChat.ms_id, page_id: cur_page.page_id, op: "conversations", op1 : 'get', offset: app.messagePage, limit: app.messageLimit});
				if(app.messagePage == 0){
					param[0].expand = {comments: {}, refs:{}, appointments: {}};
					if(app.viewActions)
						param[0].expand.inboxActions = {}

					if(app.calendars && !app.calendars.length)
						param[0].expand.appointments = null;
				}
				
				if(app.waTemplates === null){				
					param.push({page_id: cur_page.page_id, op: "whatsapp", op1 : 'templates',  op2 : 'get'});
					param.push({page_id: cur_page.page_id, op: "product", op1 : 'get', op2:'get', inbox: true });
					param.push({page_id: cur_page.page_id, op: "product", op1 : 'settings', op2:'get'});
					param.push({page_id: cur_page.page_id, op: "whatsapp", op1 : 'templateNames',  op2 : 'get'});
					param.push({page_id: cur_page.page_id, op: "calendars", op1 : 'get', active: true});
				}

				


				execute_request(param, null, null, false, function (json) { 
					let reoderMessages = false;
					if (app.waTemplates === null && json[1].status == "OK"){
						for(let i = 0; i < json[1].results.length; ++i)
							json[1].results[i].json_builder = JSON.parse(json[1].results[i].json_builder);
	
						app.waTemplates = json[1].results;
						app.products = json[2].results;
						mainData.products = json[2].results;
						app.ecommerceSettings = json[3].data;
						app.waTemplateNames = json[4].results;
						app.calendars = json[5].results;
					}

					if (json[0].status == "OK"){
						//if lastInteraction was worng for some reason, updated it. 
						if(json[0].lastInteraction && app.activeChatInfo)
							app.activeChatInfo.t_last_interaction = json[0].lastInteraction

						if(json[0].expand){
							if(json[0].expand.appointments){
								let appointments = json[0].expand.appointments;
								for(let i = 0; i < appointments.next.length; i++){
									let item = appointments.next[i];
									item.calendar = getItemName(app.calendars, item.calendar_id, null, 'item');
									item.eventLink = appDomain+'booking/schedules?p='+ cur_page.page_id + '&h=' + item.hash;
									item.dateFormated = UTC_to_local_strdate(item.start_date);
									appointments.next[i] = item;
								}

								app.userAppointments = appointments;

							}


							if(json[0].expand.comments){
								app.userComments = json[0].expand.comments;
								for(let i = 0; i < app.userComments.length; i++){
									let timestamp = app.userComments[i].t_dt * 1000;
									if(app.userComments[i].channel == 0){
										let parts = app.userComments[i].comment_id.split("_");  
										if(parts.length > 1){
											let fbPostLink = "https://www.facebook.com/"+cur_page.username+"/posts/"+parts[0]+"/?comment_id="+parts[1];
											app.activeChatMessages.push({data:{action: {type: 1, text: myi18n.t('i.msg7'), urlLabel: myi18n.t('i.viewComment'), url: fbPostLink}, timestamp}, timestamp: timestamp});
										}
									}else{
										app.activeChatMessages.push({data:{action: {type: 1, text: myi18n.t('i.msg7')}, timestamp}, timestamp: timestamp});
									}
									
								}
							}

							if(json[0].expand.inboxActions){
								let timestamp;
								app.userInboxActions = json[0].expand.inboxActions;
								for(let i = 0; i < app.userInboxActions.length; i++){
									let item = app.userInboxActions[i], text = '', subTitle = null;
									timestamp = item.t_dt * 1000;

									if(item.data !== '')
										item.data = JSON.parse(item.data);

									if(item.type == 1)
										text = myi18n.t('rul.msg6');
									else if(item.type == 2)
										text = myi18n.t('rul.msg7');
									else if(item.type == 3){
										text = myi18n.t('rul.tagApplied');
										if(app.tags)
											subTitle = getItemName(app.tags, item.item_id);
									}else if(item.type == 4){										
										text = myi18n.t('rul.tagRemoved');
										if(app.tags)
											subTitle = getItemName(app.tags, item.item_id);
									}else if(item.type == 5){
										text = myi18n.t('rul.msg1');
										if(app.sequences)
											subTitle = getItemName(app.sequences, item.item_id);
									}else if(item.type == 6){
										text = myi18n.t('rul.msg2');
										if(app.sequences)
											subTitle = getItemName(app.sequences, item.item_id);
									}else if(item.type == 7){
										text = myi18n.t('rul.msg3');
										if(app.customFields){
											subTitle = getItemName(app.customFields, item.item_id);
											if(subTitle){
												if(item.data !== '')
													subTitle = myi18n.t('i.msg10', [subTitle, cf_value(item.data.type, item.data.value, false)])
											}
										}
									}else if(item.type == 8)
										text = myi18n.t('rul.callStarted');
									else if(item.type == 9)
										text = myi18n.t('rul.callEnded');
									else if(item.type == 10){
										text = myi18n.t('rul.msg20');
										subTitle = app.getAdminInfo(item.item_id, 'name');
									}else if(item.type == 11)
										text = myi18n.t('rul.msg21');
									else if(item.type == 12){
										text = myi18n.t('rul.msg25');
										if(app.customFields)
											subTitle = getItemName(app.customFields, item.item_id);

									}else if(item.type == 13)
										text = myi18n.t('rul.msg22');
									else if(item.type == 14)
										text = myi18n.t('rul.msg23');
									else if(item.type == 15)
										text = myi18n.t('rul.msg24');
									else if(item.type == 16)
										text = myi18n.t('blocked');
									else if(item.type == 17)
										text = myi18n.t('rul.msg26');
									else if(item.type == 18){										
										text = myi18n.tc('i.msg13', app.getAdminInfo(item.data.admin, 'name'));
										if(item.data.type ==  'flow')
											subTitle = getItemName(app.pageFlows, item.item_id, ['id', 'd']);

									}else
										continue;
									

									app.activeChatMessages.push({data:{action: {type: 1, text: text, subTitle}, timestamp}, timestamp: timestamp});
								}
							}


							if(json[0].expand.refs){
								app.userRefs = json[0].expand.refs;

								for(let i = 0; i < app.userRefs.length; i++){
									try{
										let timestamp = app.userRefs[i].t_dt * 1000;
										if(app.userRefs[i].source == 2){
											let data = JSON.parse(app.userRefs[i].data);
											let link = get_link(data.ref, null, app.userRefs[i].channel, false);
											app.activeChatMessages.push({data:{action: {type: 1, text: myi18n.t('i.msg8'), url: link, urlLabel: link}, timestamp}, timestamp: timestamp});
										}else if(app.userRefs[i].source == 4 && whitelabel.id != 147){
											let data = JSON.parse(app.userRefs[i].data), subTitle = null, url = null;
											if(data.source_url){
												url = data.source_url;
												subTitle = data.headline ? data.headline : data.ad_id;
											}else if(data.ads_context_data){
												if(data.ads_context_data.post_url)
													url = data.ads_context_data.post_url;
												else if(data.ads_context_data.photo_url)
													url = data.ads_context_data.photo_url;
												else if(data.ads_context_data.video_url)
													url = data.ads_context_data.video_url;

												if(data.ads_context_data.ad_title)
													subTitle = data.ads_context_data.ad_title;											
											}

											app.activeChatMessages.push({data:{action: {type: 1, text: myi18n.t('i.msg9'), subTitle, url: url, urlLabel: myi18n.t('i.viewAd')}, timestamp}, timestamp: timestamp});
										}
									}catch(ex){}
								}
							}
							
						}

						if(app.userComments.length || app.userRefs.length || app.userInboxActions.length)
							reoderMessages = true;


						var d = json[0].data;		
						var d2 = [];

						let senIdx = 0;

						if(d.length > 0){
							for(let i = d.length-1; i >= 0; i--)
							{
								try{
									d[i].message = JSON.parse(d[i].message);									
									d[i] = app.convertMessage(d[i], d);									
									
									if(d[i].channel == 5 && d[i].message && d[i].message[0].type === 'template')
										d[i].message[0] = app.processWATemplates(d[i].message[0]);

									
									

									d2.push({
										data: d[i]
									});
								}catch(ex){};
							}
							
						}else
							app.findMessageLimit = true;
							
						

						d2 = d2.concat(app.activeChatMessages);

						if(reoderMessages)
							d2 = app.sortMessages(cloneObj(d2));

						let idx = null;

						let lastDateVisible = null;
						
						for(let i = 0; i < d2.length; i++){
							try{
								if(d2[i].data.timestamp){
									d2[i].data.dateVisible = moment(d2[i].data.timestamp, "x").format('LL');
									if(d2[i].data.dateVisible === lastDateVisible)
										d2[i].data.dateVisible = null;
									else
										lastDateVisible = d2[i].data.dateVisible;
								}
								

								if(d2[i].data.dir == 0 && d2[i].data.timestamp <= app.activeChat.t_last_seen)
									idx = i;

								if(d2[i].data.action && d2[i].data.action.type === 0)
									d2[i].ignore = true;

							}catch(ex){}
						}

						
						

						if(idx !== null)
							d2.splice(idx +1, 0, {data: {action: {type: 0}}, timestamp: app.activeChat.t_last_seen, info: app.messageInfo(null, app.activeChat.t_last_seen)});

						app.activeChatMessages = d2;


						if($(".chat-area")[0])
						{
							if(app.messagePage == 0)
								setTimeout(function(){
									$(".chat-area").scrollTop($(".chat-area")[0].scrollHeight);
								}, 200);
							else
								setTimeout(function(){
									$(".chat-area").scrollTop($(".chat-area")[0].scrollHeight - lastChatHeight);
								}, 200);
						}

						if(app.messagePage == 0 && app.activeChatMessages.length > 0){
							let msg = app.activeChatMessages[app.activeChatMessages.length - 1];
							if(msg.data && msg.data.channel !== undefined){
								app.lastMessage = msg;
								let channel = msg.data.channel;
								if(channel == 15){
									if(cur_page.sms)
										channel = 2;
									else if(cur_page.whatsapp)
										channel = 5;
								}									
								
								app.selectChatSendChannel(getItemName(channels, channel, null, 'item'));
							}
						}

						
						

						app.loadingMessages = false;
						app.messagePage += app.messageLimit;

						if($(".chat-area")[0])
							lastChatHeight = $(".chat-area")[0].scrollHeight;

						
						
					}
				});

			},

			getMessage(msg_id, msgs){
				let msg = null;
				if(msgs){
					for(let i = 0; i < msgs.length; i++){
						if(msg_id == msgs[i].id)
							msg = msgs[i];
					}
				}

				if(!msg){
					for(let i = 0; i < app.activeChatMessages.length; i++){
						if(msg_id == app.activeChatMessages[i].id)
							msg = app.activeChatMessages[i];
					}
				}

				return msg;

			},
			convertMessage(d, moreMsgs){
				try{
					if(d.message){

						let messages = [];
						for(i = 0; i < d.message.length; i++){
							if( typeof d.message[i] === 'object' && d.message[i] !== null)
								messages.push(d.message[i]);
						}

						d.message = messages

						if(d.channel == 5){
							if(d.message[0].text !== undefined && d.message[0].referred_product){
								if(d.message[0].referred_product.id)
									d.message[0].product = getItemName(app.products, d.message[0].referred_product.id, null, 'item');
								
							}else if(d.message[0].type == 'interactive'){
								if(d.message[0].interactive.type == 'product'){
									let product = getItemName(app.products, d.message[0].interactive.action.product_retailer_id, ['sku', 'name'], 'item');
									if(product)
										d.message[0].product = product;
								}else if(d.message[0].interactive.type == 'product_list'){
									let message = {channel: d.message[0].channel, dir: d.message[0].dir,  attachment:{type: 'template', payload:{template_type: 'generic', elements: []}}}
									let product_items = d.message[0].interactive.action.sections[0].product_items;
									
									for(let i = 0; i < product_items.length; i++){
										let product = getItemName(app.products, product_items[i].product_retailer_id, ['sku', 'name'], 'item');
										if(product){
											let subtitle = '';
											if(product.t == 1){
												if(product.o3 !== '')
													subtitle = product.o0 + ' • '+ product.o1 + ' • '+product.o2 + ' • '+ product.o3;
												else if (product.o2 !== '')
													subtitle = product.o0 + ' • '+ product.o1 + ' • '+product.o2;
												else if (product.o1 !== '')
													subtitle = product.o0 + ' • '+ product.o1;
												else
													subtitle = product.o0
											}

											message.attachment.payload.elements.push({title: product.n, subtitle: subtitle, image_url: product.img ? product.img: null, subtitle1: formatMoney(product.p, app.ecommerceSettings.currency)})
										}

									}
									d.message[0] = message;
								}
							}
						}else if(d.channel == 10){
							if(d.message[0].attachment && d.message[0].attachment.type == 'template'){
								if(d.message[0].attachment.payload.generic){
									d.message[0].attachment.payload.template_type = 'generic';
									d.message[0].attachment.payload.elements = d.message[0].attachment.payload.generic.elements;
								}
							}
							
						}

						for(let i = 0; i < d.message.length; i++){
							if(!d.message[i].info)
								d.message[i].info = app.messageInfo(d.message[i], d.timestamp)
							
							if(d.message[i].toMsg && !d.message[i].toMsgReady){
								d.message[i].toMsgReady = true;	
								let repliedMsg = app.getMessage(d.message[i].toMsg, moreMsgs);
			
								if(repliedMsg){
									repliedMsg = cloneObj(repliedMsg);
									let msg = repliedMsg.message[0];
									msg.dir = d.message[i].dir;
									msg.repliedMsg = true;
									if(msg.info)
										msg.info.full = myi18n.t('i.msg16');
									else
										msg.info = {full: myi18n.t('i.msg16')};
			
									d.message.unshift(msg);
									i++;
								}
		
														
							}
						}

						
					}
					

					

					
					
				}catch(ex){};

				


				return d;
			},
			processWATemplates: function(message) {
				try{
					let waT = message.template;
					for(let j = 0; j < app.waTemplates.length; j++){
						if(app.waTemplates[j].id == waT.name && app.waTemplates[j].language == waT.language.code){
							
							let tData = cloneObj(app.waTemplates[j].json_builder);

							for(let m = 0; m < waT.components.length; m++){
								let comp = waT.components[m];

								for (let k = 0; k < comp.parameters.length; k++){
									
									if(comp.type === 'body'){
										if(comp.parameters[k].type === 'text')
											tData.body.text = tData.body.text.replaceAll("{{"+(k+1)+"}}", comp.parameters[k].text);
									}else if(comp.type === 'header'){
										let pType = comp.parameters[k].type;
										if(pType !== 'text'){
											let url = '';
											if(pType === 'image')
												url = comp.parameters[k].image.link;
											else if(pType === 'video')
												url = comp.parameters[k].video.link;
											else if(pType === 'audio')
												url = comp.parameters[k].audio.link;
											else if(pType === 'document')
												url = comp.parameters[k].document.link;

												tData.header.url = url;
										}
									}
								}
							}

							message.data = tData;

							break
						}
					} 

				}catch(ex){}

				return message;
			},

			reloadMessage: function() {

				app.findMessageLimit = false;
				app.messagePage = 0;
				app.activeChatMessages = [];
				app.userComments = [];
				app.userRefs = [];
				this.loadMessage();

			},

			renderTextMessage(text){	
				var urlRegex = /(^|\s)((https?:\/\/)?[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?)/gi;
				return text.replace(urlRegex, function(url) {	
					let textURL;
					if(url.startsWith(" ")){
						url = url.substring(1);
						textURL = ' <u>' + url + '</u>'
					}else
						textURL = '<u>' + url + '</u>';

				
					if(url.includes('://'))
						finalURL = url;
					else{
						var match = /\r|\n/.exec(url);
						if (match)
							url = url.replace("\n", "");

						finalURL = "https://"+url;
					}
					
					return '<a target="blank" href="' + finalURL + '">' + textURL + '</a>';
					
				})
			},
			getAdminInfo: function(fb_id, type){
				if(!app.adminsTeams)
					return null;

				for(let i = 0; i < this.adminsTeams.length; ++i){
					if(fb_id == this.adminsTeams[i].id){
						if(type == 'name')
							return this.adminsTeams[i].name;
						else if(type == 'picture')
							return this.adminsTeams[i].profile_pic;
						else
							return this.adminsTeams[i];
					}
				}


				return null;
			},

			assignConversation: function(fb_id){
				let oldFb_id = app.activeChat.assigned_to;

				let param = {page_id: cur_page.page_id, ms_id: app.activeChat.ms_id, op: 'conversations', op1: 'update', op2: 'assign', data: {fb_id: fb_id}}
				execute_request(param, null, null, false, function (r) {
					if(r.status !== 'OK'){
						app.activeChat.assigned_to = oldFb_id;
					}
				});

				app.activeChat.assigned_to = fb_id;
				app.assignConvV = false;

			},toggleFollowUp: function (){
				let followup = app.activeChat.followup == 1 ? 0 : 1;

				app.activeChat.followup = followup;

				let param = {page_id: cur_page.page_id, ms_id: app.activeChat.ms_id, op: 'conversations', op1: 'update', op2: 'followup', data: {followup}}
				execute_request(param, null, null, false, function (r) {
					if(r.status !== 'OK')
						app.activeChat.followup = followup ? 0 : 1;
				});

			},toggleArchived: function (value){
				value = value !== null ? value : app.activeChat.archived == 1 ? 0 : 1;

				app.activeChat.archived = value;

				let param = {page_id: cur_page.page_id, ms_id: app.activeChat.ms_id, op: 'conversations', op1: 'update', op2: 'archived', data: {value: value}}
				
				app.removeUserFromList(app.activeChat.ms_id, null);
				app.activeChat = null;

				execute_request(param, null, null, false, function (r) {
					if(r.status !== 'OK'){
						msg_error();				
					}
				});

			},toggleBlocked: function (value){
				value = value !== null ? value : app.activeChat.blocked == 1 ? 0 : 1;

				app.activeChat.blocked = value;

				let param = {page_id: cur_page.page_id, ms_id: app.activeChat.ms_id, op: 'conversations', op1: 'update', op2: 'blocked', data: {value: value}}
				
				if(value){
					app.removeUserFromList(app.activeChat.ms_id, null);
					app.activeChat = null;
				}				

				execute_request(param, null, null, false, function (r) {
					if(r.status !== 'OK'){
						msg_error();				
					}
				});

			},markAsRead: function(readed){
			  	let timestamp =	readed ? Math.round(new Date().getTime()/1000) : 0

				let param = {page_id: cur_page.page_id, ms_id: app.activeChat.ms_id, op: 'conversations', op1: 'update', op2: 'read', data: {timestamp}}
				execute_request(param, null, null, false, function (r) {
					if(r.status === 'OK'){
						app.activeChat.last_read_page = timestamp;
						if(!readed)
							app.unSelectChat();
					}
				});
			},
			moveToOtherFolder: function(enable)
			{
				for(var i = 0; i < app.chats.length; i++)
				{
					if(app.chats[i].ms_id == app.activeChat.ms_id)
					{
						app.activeChat.live_chat = enable ? 1 : 0;
						
						var param = [];
						param.push({
							page_id: cur_page.page_id,
							op: "users",
							op1 : 'update',
							op2: "live-chat",
							enable: enable,
							psid: [app.activeChat.ms_id]
						});

						execute_request(param, null, null, false, function (json) {
							if (json[0].status == "OK")
							{								
								if(!enable && app.chatFolder == 0){
									app.chats.splice(i, 1);								

									app.activeChat = null;
									//if(app.chats.length > 0)
									//	app.selectChat(app.chats[0]);

									mainApp.$forceUpdate();
								}
							}else
								app.activeChat.live_chat = enable ? 0 : 1;						
						});						
						

						break;
					}
				}

				//if(app.chats.length > 0)
				//	app.selectChat(app.chats[0]);

			},

			userManager: function(cmd)
			{
				if(cmd == "delete")
					$("#deleteUserModal").modal();
				else if(cmd == "flow")
					$("#sendFlowModal").modal();				
			},

			preDeleteUser(){
				$("#deleteUserModal").modal();
			},
			deleteUser: function()
			{
				var param = [];
				param.push({
					page_id: cur_page.page_id,
					op: "users",
					op1 : 'delete',
					psid: [app.activeChat.ms_id]
				});

				pb_show(myi18n.t('processing'));

				execute_request(param, null, null, false, function (json) {
					pb_show(false);
					if (json[0].status == "OK")
					{
						app.$message({
							message: myi18n.t('success'),
							type: 'success'
						});

						for(var i = 0; i < app.chats.length; i++)
						{
							if(app.chats[i].ms_id == app.activeChat.ms_id)
							{
								app.chats.splice(i, 1);
								app.activeChat = null;
								mainApp.$forceUpdate();

								break;
							}
						}

						/*if(app.chats.length > 0)
							app.selectChat(app.chats[0]);*/
					}						
				});
			},
			finishRecording: function(){
				this.recording = 0;
				app.mediaRecorder.stop();
			},					
			cancelRecording: function(){
				this.recording = null;
				app.files = [];
				app.mediaRecorder.stop();
			},
			preSendAuido: function(){				
				navigator.mediaDevices.getUserMedia({audio: true, video: false}).then(function(stream){
					const recordedChunks = [];
					app.mediaRecorder = new MediaRecorder(stream);
			
					app.mediaRecorder.addEventListener('dataavailable', function(e) {
						if (e.data.size > 0) recordedChunks.push(e.data);
					});
			
					app.mediaRecorder.addEventListener('stop', function() {
						if(app.recording === 0){
							let blob = new Blob(recordedChunks, { type: 'audio/webm'});
							app.files = [{name: getTimestamp() + '', file: blob, type: 'voice', previewURL: URL.createObjectURL(blob)}];
							app.sendType = 'file';
							app.fileList = [];
							app.sendMessage();
						}
						
						app.mediaRecorder = null;
					});			
			
					app.mediaRecorder.start();
					app.recording = true;					
				});

			},preSendFlow: function(){
				this.sendContent = {type: 'flow', isReady: false, loading: false, flow: {id: null, flow: null, channel: this.selectedSendChannel.id, data: null, search:''}, step: {tab:'flows' ,id: null, search: '', step: null, subData: null}, waTemplate:{id: null, search: '', data: null, subData: null, subID: null, template: null}},
				$("#sendFlowModal").modal();
			},
			sendFlow: function(data, channel)
			{
				let modalM = $("#sendFlowModal");
				modalM.modal('hide');

				var param = {op: 'conversations', op1:'send', ms_id: app.activeChat.ms_id}
				if(this.sendContent.type == 'flow' || this.sendContent.type == 'step'){
					if(!data){
						data = this.sendContent.flow.flow;
						channel = this.sendContent.flow.channel;
					}else{
						if(channel == -1)
							channel = this.activeChatInfo.channel;
					}

					if(channel == 15){
						msg_error();	
						return;
					}


					param.op2 = this.sendContent.type;
					param.id = data.id;
					param.channel = channel;
				}else{
					param.op2 = 'waTemplate';
					param.channel = 5;
					let template = this.sendContent.waTemplate.template;
					param.data = {id: this.sendContent.waTemplate.id, language: this.sendContent.waTemplate.subID, components: template.components, namespace: template.json_builder.namespace}
				
				}
				
				execute_request(param, null, null, false, function (json) {
					if (json.status == "OK")
						msg_success();
				});
			},
			sendProducts: function(){
				let data = {channel: this.selectedSendChannel.id, easyMode: true}
				preSendProduct(data, function(data){
					data.ms_id = app.activeChat.ms_id;
					data.channel = app.selectedSendChannel.id;

					let param = {page_id: cur_page.page_id, op: 'product', op1:'send', data: data};
					execute_request(param, null, null, false, function (r) {
						if (r.status == "OK")
							msg_success();
						else
							msg_error();
					});
				})
			},
			createAppointment: function(op){
				let modalM = $("#createAppointment");
				if(op == 'pre'){
					modalM.modal('show');
				}else if(op == 'sendLink'){
					this.sendType = 'text';
					this.message = this.newAppointment.link;
					if(whitelabel.id == 147)
						this.message = "Click the below link to schedule a meeting.\n\n"+this.message;

					this.sendMessage();
					modalM.modal('hide');
				}else if(op == 'goToLink'){
					open_link(this.newAppointment.link, 1);
					modalM.modal('hide');
				}else{
					let user = this.activeChatInfo;
					this.newAppointment.link = appDomain+'booking/?id=' + this.newAppointment.calendarID +'&p='+cur_page.page_id+'&u='+user.ms_id+'&c='+user.code+'&ch='+this.selectedSendChannel.id
				}
				
				
			},
			sortMessages(messages){

				messages.sort(function (a, b) {
					if (a.data.timestamp > b.data.timestamp)
						return 1;
					else if(a.data.timestamp < b.data.timestamp)
						return -1;
					else{
						if(a.data.action && !b.data.action)
							return -1;
						else
							return 0;
					}
				});


				return messages;
			},
			hasUser: function(ms_id)
			{
				for(var i = 0; i < app.chats.length; i++)
				{
					if(app.chats[i].ms_id == ms_id)
					{
						return i;
					}
				}

				return -1;
			},
			removeUserFromList(ms_id, userIdx){
				if(userIdx === null)
					userIdx = app.hasUser(ms_id);

				if(userIdx !== null){				
					app.chats.splice(userIdx, 1);
					if(app.activeChat && app.activeChat.ms_id == ms_id)
						app.unSelectChat();
				}

			},
			addUserToList(ms_id, message, tryNotification){
				var param = [];
				param.push({page_id: cur_page.page_id, op: "users", op1 : 'get', ms_id: ms_id, minimal: true});

				execute_request(param, null, null, false, function (json) {

					if (json[0].status == "OK" && json[0].data){
						var x = json[0].data;
						if(!x)
							return;

						let archived = app.filters.others.includes("archived") ? 1 : 0;

						if((app.chatFolder == -1 || x.live_chat == 1 && app.chatFolder == 0 || x.live_chat == 0 && app.chatFolder == 1) && (app.filters.channel == -1 || app.filters.channel == x.channel) 
						&& (!app.filters.others.includes("followup") || x.followup == 1) && (app.filters.assigned_to == -1 || x.assigned_to == app.filters.assigned_to)
						&& archived  == x.archived){
							x.last_msg = formatLastMessage(message);
							x.timestamp = message.timestamp;
							app.chats = [x].concat(app.chats);

							if(tryNotification && message.data.dir == 1 && document.visibilityState !== 'visible' && message.data.liveChat && (x.assigned_to == 0 || x.assigned_to == my_perm.fb_id))
								sendBrowserNotification(cur_page.name, x.full_name+": "+x.last_msg, cur_page.picture, 'inbox?acc='+cur_page.page_id+"&id="+x.ms_id, cur_page.page_id+"-"+x.ms_id, cur_page.picture);
						}						
					}
					
				});
			},
			selectUserFromQuery: function(ms_id)
			{
				var i = app.hasUser(ms_id);
				if(i >= 0)
					app.selectChat(app.chats[i]);
				else
				{
					var param = [];
					param.push({page_id: cur_page.page_id, op: "users", op1 : 'get', ms_id: ms_id});

					app.loadingChatInfo = true;
					execute_request(param, null, null, false, function (json) {

						if (json[0].status == "OK")
						{
							app.selectChat(json[0].data);
						}
						
					});
				}
			},

			canSendMessage: function() {
				if(app.connecting || app.selectedSendChannel.id == 15){
					this.messageComposer = false;
					return false;
				}


				if(app.selectedSendChannel.maxDays)
				{
					if(Number(app.activeChatInfo.t_last_interaction) + (1000 * 60 * 60) * Number(app.selectedSendChannel.maxDays) < new Date().getTime()){
						this.messageComposer = false;
						return false;
					}
				}
				
				this.messageComposer = true;
				return true;
			},

			canSendMessagePlaceholder: function() {

				if(!app.canSendMessage()){
					if(app.connecting)
						return myi18n.t('i.msg6');
					else
						return app.selectedSendChannel.maxDaysMessage;
				}

				return myi18n.t('message')+'...';
			},

			messageInfo: function(data, timestamp){
				let sent = moment(timestamp, "x").format('LLL');				
				let str = sent;
				let sentBy = null;
				try{
					if(data.dir == 0 && data.from){
						str+="\n";
						if(data.from == -1){
							sentBy = myi18n.tc('i.msg11', 'Facebook Inbox');
							str+=sentBy;
						}else if(data.from == -2){
							sentBy = myi18n.tc('i.msg11', 'Instagram Inbox');
							str+= sentBy;
						}else{
							let admin = this.getAdminInfo(data.from, 'json');
							if(admin){
								sentBy = myi18n.tc('i.msg11', admin.name);
								str+=sentBy;
							}
	
						}
					}else if(data.place_id){
						let locationName = getItemName(app.gbmLocations, data.place_id, ['place_id', 'name']);

						if(locationName)
							str+="\n"+locationName;
					}
				}catch(ex){}

				if(data && data.failed)
					str+="\n\n"+myi18n.t('i.msg19');

				
				return {full: str, sentTime: sent, sentBy: sentBy, visible: false};
			},
			showEmojiBox(){
				insertEmoji('.chat-input .i_text textarea', function(val){
					app.message = val;
				})
			},swimLaneInfo: function(status){
				try{
					if(app.swimline && app.swimline['i'+status])
						return app.swimline['i'+status];

				}catch(ex){}
				return '';
			},
			swimLaneChanged(item){
				let oldvalue = [];
				for(let i = 0; i < app.swimLineInfo.lastValue.length; i++)
					oldvalue.push(JSON.stringify(app.swimLineInfo.lastValue[i]));

				let newValue = []
				for(let i = 0; i < item.value.length; i++)
					newValue.push(JSON.stringify(item.value[i]));

				if(item.value.length > app.swimLineInfo.lastValue.length){
					let difference = newValue.filter(x => !oldvalue.includes(x));
					difference = JSON.parse(difference[0]);

					newValue = cloneObj(item.value);
					for(let i = 0; i < newValue.length; i++){
						if(difference[0] == newValue[i][0] && difference[1] != newValue[i][1]){
							newValue.splice(i, 1);
						}
					}

					item.value = newValue;
					app.changeSwimLine({jobID: difference[0], stepID: difference[1]}, false);
					app.swimLineInfo.lastValue = cloneObj(newValue);
				}else{	
					let difference = oldvalue.filter(x => !newValue.includes(x));
					
					difference = JSON.parse(difference[0]);

					newValue = cloneObj(item.value);
					item.value = cloneObj(app.swimLineInfo.lastValue);
					
					show_model(true, myi18n.tc('msg2')+ ' '+myi18n.t('msg3'), myi18n.t('delete'), myi18n.t('cancel'), "");
					$("#btt_yes").click(function () {
						app.swimLineInfo.lastValue = cloneObj(newValue);
						item.value = newValue;

						app.changeSwimLine({jobID: difference[0], stepID: 0}, true);						
					});
				
				}
				
			},changeSwimLine(item, unaplay){
				let param = null;

				if(unaplay){
					param = {page_id: cur_page.page_id, op: "users", op1 : 'update', op2: "jobs", op3: 'delete', data: {id: item.jobID}, psid: [app.activeChat.ms_id]};
				}else{
					param = {page_id: cur_page.page_id, op: 'jobs', op1: 'swimline', op2:"moveContact", data:{jobID: item.jobID, ms_id: app.activeChat.ms_id, stepID: item.stepID}}; 
				}

				execute_request(param, null, null, false, function (json) {
					if (json.status == "OK"){
						if(unaplay){
							let idx = app.activeChatInfo.jobs.indexOf(item.jobID)
							if(idx >= 0){								
								app.activeChatInfo.jobs.splice(idx, 1);

								if(app.activeChat.custom0 !== ''){
									let job = getItemName(app.jobs, item.jobID, null, 'item');
									let step = getItemName(job.data.steps, app.activeChat.custom0, null, 'item');
									if(step)
										app.activeChat.custom0 = '';
								}
								
							}

						}else{
							if(!app.activeChatInfo.jobs.includes(item.jobID))
								app.activeChatInfo.jobs.push(item.jobID);
								
							if(item.stepID != 0)
								app.activeChat.custom0 = item.stepID;
						}
					}else
						msg_error();
						
				});
			},
			startEditCFields(item, index){
				if(!item){
					app.editField.chooseCF.step = 'looding';	
					item = {id: 300, name: app.editField.chooseCF.name, type: app.editField.chooseCF.type}

					param = { op: 'custom-fields', op1: 'add', name:item.name, type: item.type, botfield: 0, value: '', descr: '', folder: 0}
					execute_request(param, null, null, false, function (data) {
						if (data.status == 'OK') {                    
							item.id = data.id;							
							app.editField.chooseCF.active = false;
							app.editField.chooseCF.step = 'select';
							app.startEditCFields(item, null);
						}else
							msg_error(myi18n.t('msg0'));
					}); 

				}else if(item.value !== undefined){
					if(item.type == 2 || item.type == 3)					
						app.editField.value = item.value * 1000;
					else if(item.type == 4)
						app.editField.value = item.value ? true : false;
					else
						app.editField.value = item.value;
				}else{
					app.editField.chooseCF.active = false;
					item = cloneObj(item);
					if(item.type == 0)
						item.value = '';
					else if(item.type == 1)
						item.value = 0;
					else if(item.type == 2 || item.type == 3)
						item.value = getTimestamp();
					else
						item.value = 1;

					item.editing = false;
					item.formatedValue = '---- '+myi18n.t('edit')+' ----';
					app.activeChatInfo.custom_fields.push(item);
					if(index !== null)
						app.activeChatInfo.customFieldsNovalue.splice(index, 1)
				}
			},
			renameContact(){
				app.userRenameP = false;
				
                let form = {title: myi18n.t('rename'), rows: [{id:'first_name', label: myi18n.t('u.firstName'), value: app.activeChatInfo.first_name},
				 {id:'last_name', label: myi18n.t('u.lastName'), value: app.activeChatInfo.last_name, required: false}, 
				 {id:'full_name', label: myi18n.t('u.fullName'), value: app.activeChatInfo.full_name, required: false}]}
				showForms(form, function(data){
					if(data.full_name === ''){
						if(data.last_name === '')
							data.full_name = data.first_name;
						else
							data.full_name = data.first_name+' '+data.last_name;
					}

					var param = [{page_id: cur_page.page_id, op: 'users', op1: 'custom-field', op2: 'set', ms_id: app.activeChatInfo.ms_id, field_type: -1, field_id: -1, value: data.first_name},
						{page_id: cur_page.page_id, op: 'users', op1: 'custom-field', op2: 'set', ms_id: app.activeChatInfo.ms_id, field_type: -1, field_id: -2, value: data.last_name},
						{page_id: cur_page.page_id, op: 'users', op1: 'custom-field', op2: 'set', ms_id: app.activeChatInfo.ms_id, field_type: -1, field_id: -10, value: data.full_name}];
					
					app.activeChatInfo.first_name = data.first_name;
					app.activeChatInfo.last_name = data.last_name;
					app.activeChatInfo.full_name = data.full_name;

					execute_request(param, null, null, false, function (data) {
						if (data[0].status != 'OK') {
							msg_error();
							window.location.reload();
						} 
					});
                })

			},
			editCFields(item){
				value = app.editField.value;

				if(item.type == 2 || item.type == 3)
					value = value / 1000;
				else if (item.type == 4)
					value = value ? 1 : 0;

				item.editing = false;
				item.value = value;
				item.formatedValue = cf_value(item.type, value, true);

				var param = {page_id: cur_page.page_id, op: 'users', op1: 'custom-field', op2: 'set', ms_id: app.activeChatInfo.ms_id, field_type: item.type, field_id: item.id, value: value};
				execute_request(param, null, null, false, function (data) {
					if (data.status != 'OK') {
						msg_error();
						window.location.reload();
					}else{
						if(item.id == -8){
							app.activeChatInfo.phone = value;
							app.activeChat.phone = value;
							userChannels = getActiveChannels(app.activeChatInfo);
							app.$forceUpdate();
						}
					}
				}); 
			},
			unsetCustomField: function(item, index){
				item.editing = false;
				show_model(true, myi18n.tc('msg2')+ ' '+myi18n.t('msg3'), myi18n.t('delete'), myi18n.t('cancel'), "");
                $("#btt_yes").click(function () {
                    var param = {page_id: cur_page.page_id, op: 'users', op1: 'custom-field', op2: 'delete', ms_id: app.activeChatInfo.ms_id, field_type: item.type, field_id: item.id};
					execute_request(param, null, null, true, function (data) {
						if (data.status == 'OK'){
							app.activeChatInfo.custom_fields.splice(index, 1);	
						} else
							show_model(true, myi18n.t('msg0'), myi18n.t('ok'), "");
					});	
                });		
			},
			askBrowserNotification(){
				return new Promise(function (resolve, reject) {
					const permissionResult = Notification.requestPermission(function (result) {
					  resolve(result);
					});
				
					if (permissionResult) {
					  permissionResult.then(resolve, reject);
					}
				  }).then(function (permissionResult) {
					if(permissionResult !== 'default')
						app.showBttAskNtfc = false;

					if (permissionResult === 'granted') {
						navigator.serviceWorker.register(getPHPUserScript('/js/serviceWorker.js')).
						then(function (registration) {
							const subscribeOptions = {
								userVisibleOnly: true,
								applicationServerKey: urlBase64ToUint8Array(
								'BLrftxtsKkPkm1JlAk00XCFzC7RP3VWB3fS7YKn18jG2wtbGAROcrmqcWDXTmj1LLv726LTG9xIznjt_RowXogc',
								),
							};

							return registration.pushManager.subscribe(subscribeOptions);
						}).then(function (pushSubscription) {
							let param = {page_id: cur_page.page_id, op: 'pushManager', op1: 'add', data: pushSubscription, source: 'inbox'}

							execute_request(param, null, null, false, function (r) {                
								if (r.status == "OK"){
									msg_success();
								}else
									msg_error();
							});
						});
					}

							
				});				
			},
			onSendContenChange(type, data){
				if(this.sendContent.type == 'wa_template'){
					if(type === 'name'){
						let item = getItemName(this.waTemplateNames, this.sendContent.waTemplate.id, null, 'item');
						this.sendContent.waTemplate.subID = item.lngs[0];
						this.sendContent.waTemplate.subData = item.lngs;
						this.onSendContenChange('language');
					}else if(type === 'language'){
						let template = cloneObj(getWATemplate(this.waTemplates, this.sendContent.waTemplate.id, this.sendContent.waTemplate.subID))
						template.preview = {body: null, footer: null, header: null, };

						let json = template.json_builder;
						let components = {body: null, header: null}

						if(json.body){
							 template.preview.body = template.json_builder.body.text;

							if(json.body.pers){
								components.body = {pers: []};
								for(let i = 1; i <= json.body.pers; i++)
									components.body.pers.push({label:'{{'+i+'}}', value: ''})
							}
						}
						

						if(json.header){	
							let format = json.header.format;
							let acceptFile = 'image/*'						
							if(format == 'TEXT' && json.header.pers){
								template.preview.header = template.json_builder.header.text;

								components.header = {format: 'TEXT', pers: [], enabled: true};

								for(let i = 1; i <= json.header.pers; i++)
									components.header.pers.push({label:'{{'+i+'}}', value: ''})

							}else{
								let icon = '', uploadLabel = '';
								if(format == 'DOCUMENT'){
									icon = 'fal fa-paperclip';
									uploadLabel = myi18n.t('uploadFile');
									acceptFile = '*/*';
								}else if(format == 'IMAGE'){
									icon = 'fa-light fa-image';
									uploadLabel = myi18n.t('uploadImage');
									acceptFile = 'image/*';
								}else if(format == 'VIDEO'){
									icon = 'fa-light fa-video';
									uploadLabel = myi18n.t('uploadVideo');
									acceptFile = 'video/*';
								}

								components.header = {format, url:'', fileName: '', icon,  uploadLabel, acceptFile, enabled: true};
							}
						}

						template.components = components;

						this.sendContent.waTemplate.template = template;
						this.sendContent.isReady = isWaTemplateReady(this.sendContent.waTemplate.template.components);
						
					}else if(type === 'body' || type === 'footer' || type === 'header'){
						let template = this.sendContent.waTemplate.template;
						let pers = template.components[type].pers;
						let stPreview = template.json_builder[type].text;

						for(let i = 0; i < pers.length; i++){
							if(pers[i].value !== '')
							stPreview = stPreview.replaceAll(pers[i].label, pers[i].value)
						}

						this.sendContent.waTemplate.template.preview[type] = stPreview;
						app.sendContent.isReady = isWaTemplateReady(app.sendContent.waTemplate.template.components);
					}
				}else if(this.sendContent.type == 'step'){
					if(type === 'flow'){
						this.sendContent.step.subData = null;
						this.sendContent.step.tab = 'steps';
						apiGetSteps(data.id, function(r){
							if(r)
								app.sendContent.step.subData = r;
							else{
								msg_error();
								app.sendContent.step.tab = 'flows';
							}
						})
					}else if(type === 'step'){
						this.sendContent.step.tab = 'step';
						this.sendContent.step.step = data;
					}
				}
			},
			previewFile(type, url){
				this.dialogPreviewFile.type = type;
				this.dialogPreviewFile.url = url;
				this.dialogPreviewFile.visible = true;			
			}

		},

	});

	

});

var threadTryReconnect = null;
var triedToConnect = 0;
function tryConnect()
{
	
	if(ws == null || ws.readyState == 3)
	{
		ws = null; 
		
		if(!whitelabel)
			return;
		
		let url = whitelabel.wsurl;

		ws = new WebSocket(url);	

		ws.onopen = function (event) {
			triedToConnect = 0;
			app.connecting = false;
			if(app.activeChatInfo && app.activeChatInfo.ms_id){
				ws.send(JSON.stringify({
					action: -1,
					data: {
						dir: dir, // 0 = out, 1 = in
						from: sentBy,
						channel: app.activeChat.channel, // channel type
						page_id: pageId,
						ms_id: app.activeChatInfo.ms_id,
						hash: app.activeChatInfo.hash
					}					
				}));
			}
		};

		ws.onerror = function (event) {};

		ws.onclose = function (event) {
			app.connecting = true;
			triedToConnect++;
			threadTryReconnect = setTimeout(tryConnect, 1000);
		};

		ws.onmessage = function (event) {
			var message = JSON.parse(event.data);
			if(app.sendingFile && message.action == 0 && message.data.message.length > 0 && message.data.message[0].dir == 0 
				&& message.data.message[0].attachment && ['image', 'video', 'audio', 'file'].includes(message.data.message[0].attachment.type)){
				app.sendingFile = false;
			}

			
			
			
			if(message.data.ms_id === null){
				for(let i = 0; i < message.data.message.length; i++){
					let userIdx = app.hasUser(message.data.message[i].ms_id);
					if(userIdx >= 0){
						if(message.data.message[i].type === 'assign'){
							if(message.data.message[i].data.fb_id != my_perm.fb_id && my_perm.u == 1){
								app.removeUserFromList(message.data.message[i].ms_id, userIdx);
							}else
								app.chats[userIdx].assigned_to = message.data.message[i].data.fb_id;
							
						}else if(message.data.message[i].type === 'live_chat')
							app.chats[userIdx].live_chat = message.data.message[i].data.live_chat;
						else if(message.data.message[i].type === 'followup')
							app.chats[userIdx].followup = message.data.message[i].data.followup;
						else if(message.data.message[i].type === 'archived')
							app.chats[userIdx].archived = message.data.message[i].data.archived;
					}else{
						if(message.data.message[i].type === 'assign'){
							if(message.data.message[i].data.fb_id == my_perm.fb_id)
								app.addUserToList(message.data.message[i].ms_id, message, true);
							
						}
					}
				}

				return;
			}else if(app.activeChat && message.data.ms_id  == app.activeChat.ms_id){	
				let userIdx = app.hasUser(app.activeChat.ms_id);
				let x = app.activeChat;

				let hasMessage = false;
				if(message.data.message && message.data.message.length){
					for(let i = 0; i < message.data.message.length; i++){
						if(message.data.message[i].type === 'assign'){
							if(message.data.message[i].data.fb_id != my_perm.fb_id && my_perm.u == 1){
								app.removeUserFromList(message.data.message[i].ms_id, userIdx);
								return;
							}else
								app.chats[userIdx].assigned_to = message.data.message[i].data.fb_id;

							message.data.message[i] = null;
							
						}else if(message.data.message[i].type === 'live_chat'){
							app.chats[userIdx].live_chat = message.data.message[i].data.live_chat;
							message.data.message[i] = null;
						}else if(message.data.message[i].type === 'followup'){
							app.chats[userIdx].followup = message.data.message[i].data.followup;
							message.data.message[i] = null;
						}else if(message.data.message[i].type === 'archived'){
							app.chats[userIdx].archived = message.data.message[i].data.archived;
							message.data.message[i] = null;
						}else
							hasMessage = true;
					}
					

					message.data = app.convertMessage(message.data, []);
					
					if(message.data.message[0] && message.data.message[0].channel === 5 && message.data.message[0].type === 'template')
						message.data.message[0] = app.processWATemplates(message.data.message[0]);
					
				}

				

				if(message.data.type === 'message'){

					if(hasMessage){
						if(message.data.dir == 1 && message.data.message && message.data.message.length){
							x.t_last_interaction = message.data.timestamp;
							app.activeChatInfo.t_last_interaction = x.t_last_interaction;
						}
						
						x.last_active = message.data.timestamp / 1000;
						app.canSendMessage();
					}
					

				}else if(message.data.type === 'seen'){
					x.t_last_seen = message.data.timestamp;

					for(let i = 0; i < app.activeChatMessages.length; i++){
						try{
							if(app.activeChatMessages[i].data.action && app.activeChatMessages[i].data.action.type === 0)
								app.activeChatMessages[i].ignore = true;
						}catch(ex){}
					}
					app.activeChatMessages.push({data: {action: {type: 0}}, timestamp: message.data.timestamp, info: app.messageInfo(null, message.data.timestamp)});					
					return;
				}else if(message.data.type === 'delivered'){
					x.t_last_delived = message.data.timestamp;					
					return;
				}

				
					
				
				
				// reordenar
				if(app.activeChatMessages.length > 0 && message.data.timestamp < app.activeChatMessages[app.activeChatMessages.length-1].data.timestamp)
				{
					
					app.activeChatMessages.push(message);

					app.activeChatMessages.sort(function (a, b) {
						if (a.data.timestamp > b.data.timestamp)
							return 1;
						else (a.data.timestamp < b.data.timestamp)
							return -1;

						return 0;
					});
				}
				else
					app.activeChatMessages.push(message);

			
				
				setTimeout(function(){
					$(".chat-area").scrollTop($(".chat-area")[0].scrollHeight);
				}, 100);

				

				if(hasMessage){
					x.last_msg = formatLastMessage(message);
					x.timestamp = message.timestamp;
	
					if(message.data.dir == 1)
						x.t_last_sent = message.timestamp;
	
					app.chats.splice(userIdx, 1);
					app.chats = [x].concat(app.chats);
	
					if(!document.hidden)
						app.markAsRead(true);
	
	
					if(message.data.dir == 1 && document.visibilityState !== 'visible' && message.data.liveChat && (x.assigned_to == 0 || x.assigned_to == my_perm.fb_id))
						sendBrowserNotification(cur_page.name, x.full_name+": "+x.last_msg, cur_page.picture, 'inbox?acc='+cur_page.page_id+"&id="+x.ms_id, cur_page.page_id+"-"+x.ms_id, cur_page.picture);
	
					app.$forceUpdate();
				}
				

			}else{
				// verify if exists in current chat list
				let userIdx = app.hasUser(message.data.ms_id);

				if(userIdx >= 0)
				{

					let hasMessage = false;
					
					var x = app.chats[userIdx];
					if(message.data.type === 'seen'){
						x.t_last_seen = message.data.timestamp;
					}else if(message.data.type === 'delivered'){
						x.t_last_delived = message.data.timestamp;
					}else{

						for(let i = 0; i < message.data.message.length; i++){
							if(message.data.message[i].type === 'assign'){
								if(message.data.message[i].data.fb_id != my_perm.fb_id && my_perm.u == 1){
									app.removeUserFromList(message.data.message[i].ms_id, userIdx);
									return;
								}else
									app.chats[userIdx].assigned_to = message.data.message[i].data.fb_id;

								message.data.message[i] = null;
								
							}else if(message.data.message[i].type === 'live_chat'){
								app.chats[userIdx].live_chat = message.data.message[i].data.live_chat;
								message.data.message[i] = null;
							}else if(message.data.message[i].type === 'followup'){
								app.chats[userIdx].followup = message.data.message[i].data.followup;
								message.data.message[i] = null;
							}else if(message.data.message[i].type === 'archived'){
								app.chats[userIdx].archived = message.data.message[i].data.archived;
								message.data.message[i] = null;
							}else
								hasMessage = true;
						}

						if(hasMessage){
							x.last_msg = formatLastMessage(message);
							x.timestamp = message.timestamp;
							x.last_active = message.timestamp / 1000;

							if(message.data.dir == 0)
								x.t_last_sent = message.timestamp;
		
							app.chats.splice(userIdx, 1);
							app.chats = [x].concat(app.chats);
	
							if(message.data.dir == 1 && document.visibilityState !== 'visible' && message.data.liveChat && (x.assigned_to == 0 || x.assigned_to == my_perm.fb_id))
								sendBrowserNotification(cur_page.name, x.full_name+": "+x.last_msg, cur_page.picture, 'inbox?acc='+cur_page.page_id+"&id="+x.ms_id, cur_page.page_id+"-"+x.ms_id, cur_page.picture);
						}
						
					}					
				}
				else
				{
					if(message.data.type === 'seen' || message.data.type === 'delivered')
						return

					

					app.addUserToList(message.data.ms_id, message, true);
				}
			}

			

			
			if(message.data.message && message.data.message.length > 0 && message.data.message[0] && message.data.message[0].dir == 1 && message.data.liveChat){
				if(document.hidden && message.data.from != sentBy){
					document.title = myi18n.t('i.msg4');
				}else
					document.title = myi18n.t('inbox');
			}

		};
	}
	else
	{
		clearTimeout(threadTryReconnect);
		threadTryReconnect = null;
	}
}

function getActiveChannels(user){
	let data = [];
	
	data.push(getItemName(channels, user.channel, null, 'item'));

	if(user.phone){
		if(user.channel != 2 && cur_page.sms)
			data.push(getItemName(channels, 2, null, 'item'));

		if(user.channel != 5 && cur_page.whatsapp)
			data.push(getItemName(channels, 5, null, 'item'));

		if(user.channel != 16 && cur_page.viberbm)
			data.push(getItemName(channels, 16, null, 'item'));
	}


	return data;
}

// FUNCTIONS
var searchTimeout = null;
function searchChats()
{
	clearTimeout(searchTimeout);

	if(!app.searchText.trim())
	{
		app.reloadChats();
		return;
	}

	searchTimeout = setTimeout(function(){
		app.reloadChats();

	}, 500);
}

function formatLastMessage(msg)
{
	var m = msg.data.message;
	for(var i = 0; i < m.length; i++)
	{
		if(m[i] && m[i].text){
			if(typeof m[i].text == 'string')
				return m[i].text;
			else if(typeof m[i].text == 'object' && m[i].text.body)
				return m[i].text.body;			
		}
	}
	return "...";
}

function showCondtionDialog(){	
	if(all_otn === null)
		loadContentData({page_id: cur_page.page_id, op:'null'})
		
	app.filters.visible = false;
	let modalM = $("#conditionModal");
	modalM.modal('show');
}

flowChangedCallback = function(){	
    offset = 0;
    cdts = flows[0].data.cdts;
    app.changeChatFolder();
}

$(window).on('resize', function(){
	if(window.innerWidth >= responsiveBreak)
		app.chatMode = "desktop";
});


function fireEvent(element,event){
    if (document.createEventObject){
        // dispatch for IE
        var evt = document.createEventObject();
        return element.fireEvent('on'+event,evt)
    }
    else{
        // dispatch for firefox + others
        var evt = document.createEvent("HTMLEvents");
        evt.initEvent(event, true, true ); // event type,bubbling,cancelable
        return !element.dispatchEvent(evt);
    }
}



  function fileSelected(blob){
	if(blob.size > 26214400)
		return false;
			
	let fileType = 'file'
	if(blob.type.includes('image'))
		fileType = 'image';
	else if(blob.type.includes('video'))
		fileType = 'video';
	else if(blob.type.includes('audio'))
		fileType = 'audio';

	app.files = [{name: blob.name, file: blob, type: fileType, previewURL: null}];
	app.sendType = 'file';
	app.fileList = [];

	if(fileType == 'image'){
		var reader = new FileReader();
		reader.onload = function (event) {
			app.files[0].previewURL = event.target.result;
		}; 
	
		reader.readAsDataURL(blob);
	}
  }

  document.onpaste = function (event) {
	if(!app.activeChat)
		return;

    var items = (event.clipboardData || event.originalEvent.clipboardData).items;
    for (var index in items) {
        var item = items[index];
        if (item.kind === 'file') {
			fileSelected(item.getAsFile());
			break;
        }
    }
};



function stopRecording(){
	app.mediaRecorder.stop();
}
