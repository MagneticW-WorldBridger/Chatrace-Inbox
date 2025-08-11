<!doctype html>
<html lang="en">

<head>
    <title class="vueapp" v-t="'inbox'">...</title>   
    <script src="../js/libs/tinymce/tinymce.min.js"></script>
    <script src="../js/libs/vue-easy-lightbox.umd.min.js"></script>

    <?php include("partial/head.php") ?>    
    <link rel="stylesheet" type="text/css" href="../css/flow.css">
    <link type="text/css" rel="stylesheet" href="../css/broadcast.css">
    <link rel="stylesheet" type="text/css" href="../css/inbox.css?v=18">

    

    <script src="https://cdn.jsdelivr.net/gh/assisfery/myjs@1.0/myjs.min.js"></script>

    <style>
        #my_menu {
            height: unset;
        }
    </style>
</head>

<body class="wide">
    <div>
        <div class="vueapp">
            <?php include("partial/all.php") ?>
        </div>
    </div>

    <div class="vueapp">
        <?php include("partial/menu.php") ?>
    </div>  

    <div class="container-fluid myvue margin_nav mx-0 pr-md-0" id="app2">
		
        <div class="row">
            <div  v-if="chatMode == 'list' || chatMode == 'desktop'" class="chat-list-c col-12 col-md-3 border-right h-device pt-3 pb-0 px-0" style="overflow-y: hidden;">
                <div class="d-flex justify-content-between pr-2 mb-3 align-items-center">
                    <div v-if="showChatFolder" class="d-flex">
                        <el-select class="chat-selector mr-2" v-model="chatFolder" v-on:change="changeChatFolder" size="mini">
                            <el-option  :label="$t('i.human')" value="0"></el-option>
                            <el-option  :label="$t('i.bot')" class="mb-1" value="1"></el-option>
                            <el-option  :label="$t('i.allChats')" class="mb-1" value="-1"></el-option>
                        </el-select>
                    </div>

                    <el-select v-if="data.wt && data.wt.jobs" class="w-100 my-2" placeholder="Select Job" v-model="filters.job" size="mini" filterable v-on:change="changeChatFolder">
                        <el-option label="Applied and not applied to jobs" value="-1"></el-option>
                        <el-option v-for="item in jobs" :key="item.id" :label="item.name" :value="item.id"></el-option>
                    </el-select>
                    
                <div class="d-flex align-items-center">
                    <el-tooltip class="item" effect="dark" :content="$t('search')" placement="top">
                        <button class="btn btn-white px-2 px-3" data-toggle="collapse" data-target="#divSearch" aria-expanded="false" aria-controls="divSearch">
                            <i class="fa-light fa-magnifying-glass"></i>
                        </button>
                    </el-tooltip> 


                    <el-tooltip class="item" effect="dark" :content="$t('u.create_new_contact')" placement="top">
                        <button class="btn btn-white px-2 px-3" @click="addNewContact()">
                            <i class="fa-light fa-user-plus"></i>
                        </button>
                    </el-tooltip> 
                                       

                    <el-tooltip class="item" effect="dark" :content="$t('filter')" placement="top">
                        <el-popover
                            v-model="filters.visible"
                            placement="bottom"
                            width="300"
                            trigger="click">
                            <div class="p-3">
                                <el-select  class="w-100 my-2" :placeholder="$t('selectChannel')" v-model="filters.channel" size="small" filterable v-on:change="changeChatFolder">
                                    <el-option key="All Channels" :label="$t('allChannels')" value="-1"></el-option>
                                    <el-option v-for="item in channels" :key="item.id" :label="item.name" :value="item.id">
                                            <div class="d-flex align-items-center">
                                                <i v-bind:class="[item.icon]"  v-bind:style="{ color: item.color}"></i>
                                                <span class="ml-3">{{item.name}}</span>
                                            </div>
                                    </el-option>
                                </el-select>

                                

                                <el-select v-if="data.me && data.me.u != 1" class="w-100 my-2" v-model="filters.assigned_to" size="small" v-on:change="changeChatFolder">
                                    <el-option :label="$t('i.ibx_msg0')" value="-1"></el-option>
                                    <el-option :label="$t('i.unassigned')" value="0"></el-option>
                                    <el-option v-for="item in adminsTeams" :key="item.id" :label="$tc('i.a_to', item.name)" :value="item.id"></el-option>
                                </el-select>

                                <el-select class="w-100 my-2" v-model="filters.others" multiple :placeholder="$t('i.ibx_msg1')" size="small" v-on:change="changeChatFolder">
                                    <el-option key="no_reply" :label="$t('f.noReply')" value="no_reply">
                                        <div class="d-flex align-items-center">
                                            <i class="fa-light fa-reply icon-lg mr-2"></i>
                                            <span v-t="'f.noReply'"></span>
                                        </div>
                                    </el-option>
                                    <el-option key="unread" :label="$t('i.unread')" value="unread">
                                        <div class="d-flex align-items-center">
                                            <i class="fal fa-envelope icon-lg mr-2"></i>
                                            <span v-t="'i.unread'"></span>
                                        </div>
                                    </el-option>
                                    <el-option key="followup" :label="$t('i.followUp')" value="followup">
                                        <div class="d-flex align-items-center">
                                            <i class="fal fa-star mr-2"></i>
                                            <span v-t="'i.followUp'"></span>
                                        </div>
                                    </el-option>
                                    <el-option key="archived" :label="$t('archived')" value="archived">
                                        <div class="d-flex align-items-center">
                                            <i class="fa-light fa-box-archive mr-2"></i>
                                            <span v-t="'archived'"></span>
                                        </div>
                                    </el-option>
                                    <el-option key="blocked" :label="$t('blocked')" value="blocked">
                                        <div class="d-flex align-items-center">
                                            <i class="fa-light fa-user-lock mr-2"></i>
                                            <span v-t="'blocked'"></span>
                                        </div>
                                    </el-option>
                                </el-select>
                                
                                <button type="button" class="btn btn-light text-dark btn-sm rounded w-100 my-2"  onclick="showCondtionDialog()">{{$t('moreOption')}}  ({{cdts.length}})</button>
                            </div>  
                            <button slot="reference" class="btn btn-white px-3" >
                                <i class="fa-light fa-filter"></i>
                            </button>
                        </el-popover>                        
                    </el-tooltip>

                    
                                       
                </div>

                    <div class="px-2 py-1 hide">
                        <el-dropdown @command="changeChatChannel">
                            <span class="el-dropdown-link">
                                <i v-bind:class="[chatChannel ? chatChannel.icon : '']"></i>
                                <span v-t="'all'" v-if="!chatChannel"></span>
                            </span>
                            <el-dropdown-menu slot="dropdown">
                                <el-dropdown-item v-t="'all'" class="text-center" v-bind:command="null"></el-dropdown-item>
                                <el-dropdown-item class="text-center" v-for="h in channels" v-bind:command="h">
                                    <i v-bind:class="[h.icon]"  v-bind:style="{ color: h.color}"></i>
                                </el-dropdown-item>
                            </el-dropdown-menu>
                        </el-dropdown>
                    </div>

                </div>                

                
                <div class="collapse py-1 px-2" id="divSearch">
                    <input type="text" v-model="searchText" class="form-control search-box" :placeholder="$t('search')" v-on:input="searchChats()">
                </div>

                <div class="h-sub mt-2" id="chat-user-list">
                    <div v-if="chats">
                        <a href="#" class="btn btn-white btn-block text-left media" v-for="c in chats" v-on:click="selectChat(c)" v-bind:class="[ activeChat && c.ms_id == activeChat.ms_id ? 'btn-light' : '' ]">

                            <div class="img-profile-wrapper mr-3">
                                <div class="img-profile">
                                    <img v-bind:src="c.profile_pic" onerror="this.src = '../images/view_photo.png'">
                                </div>

                                <i v-bind:class="[h.icon]" class="channel" v-if="c.channel == h.id"  v-for="h in channels" v-bind:style="{ color: h.color}"></i>
                                <div class="favorite d-flex justify-content-center align-items-center" v-if="c.followup == 1">
                                    <i class="fa-solid fa-star"></i>
                                </div>
                                <img class="admin" v-if="c.assigned_to != 0" :src="getAdminInfo(c.assigned_to, 'picture')"/>
                            </div>

                            <div class="media-body mt-1 overflow-hidden">
                                <div class="m-0">
                                    <span class="d-inline-block text-truncate w-100" v-bind:class = "(c.timestamp/1000 > c.last_read_page)?'bold':''">
                                    {{ c.full_name !== '' ? c.full_name : c.phone }}
                                    </span>
                                    <div v-if="data.wt && data.wt.jobs && c.custom0 !== ''" class="d-flex">
                                        <i class="fa-light fa-columns-3 mr-1"></i>
                                        <span class="small text-secondary bold w-100 text-truncate">{{(swimLaneInfo(c.custom0))}}</span>
                                    </div>
                                    <div class="w-100 d-flex">
                                        <span class="d-inline-block text-truncate small" style="width: calc(100% - 25px);" v-bind:class = "(c.timestamp/1000 > c.last_read_page)?'bold':'text-secondary'">{{ c.last_msg }}</span>
                                        <div class="text-center" v-if="c.t_last_sent > 0 && c.t_last_sent <= c.t_last_seen">
                                            <el-avatar :size="16" :src="c.profile_pic">
                                                <img src="../images/view_photo.png"/>
                                            </el-avatar>
                                        </div>
                                        <i v-else-if="c.t_last_delived == -1" class="fa-light fa-triangle-exclamation text-danger"></i>
                                        <i v-else-if="c.t_last_delived > 0 && c.t_last_delived < c.t_last_sent" class="fa-light fa-circle-check"></i>
                                        <i v-else-if="c.t_last_delived > 0 && c.t_last_delived >= c.t_last_sent" class="fa-solid fa-circle-check text-secondary"></i>                                    
                                    
                                    </div>
                                    <small v-if="c.last_active != 0 || c.timestamp != 0" class="m-0 small float-right mt-1" v-if="c.timestamp || c.last_active">
                                        {{ moment(c.last_active != 0 ? c.last_active * 1000 : c.timestamp, "x").fromNow(true) }}
                                    </small>
                                </div>
                            </div>
                        </a>
                    </div>

                    <div class="text-center py-2" v-if="loadingChats">
                        <div class="spinner-border text-muted"></div>
                    </div>
                </div>
                <div class="pr-3" v-if="showBttAskNtfc">
                    <button type="button" class="btn btn-light text-dark btn-sm rounded w-100" v-on:click="askBrowserNotification()" v-t="'enableNtfc'"></button>
                </div>
            </div>

            <div v-if="chatMode == 'chat' || chatMode == 'desktop'" class="col-12 col-md-6 h-device p-0">

                <div v-if="cur_page" class="h-device">

                <div v-if="cur_page.plan == 4" class="h100 d-flex flex-row justify-content-center align-items-center">
                    <div class="text-center">
                        <h6 v-t="'i.pro_details'"></h6>
                        <a v-t="'upgd_to_pro'" :href="'billing?acc=' + cur_page.page_id" class="btn btn-primary rounded"></a>
                    </div>
                </div>

                <div v-else-if="!activeChat" class="h100 d-flex flex-row justify-content-center align-items-center">
                    <h6 v-t="'i.thread_msg'"></h6>
                </div>

                <div v-else class="h-device pb-4 chat-container">

                    <div class="border border-top-0 border-left-0 border-right-0 pb-2 pt-3 d-flex justify-content-between align-items-center">
                        <div class="m-0 text-truncate d-flex align-items-center">

                            <button class="btn d-inline-block d-md-none px-3 mr-2" id="btnBack1" @click="scrollToChatList()">
                                <i class="fal fa-chevron-left icon-lg"></i>
                            </button>
                            <div class="d-flex flex-column ml-md-4 ml-0">
                                <div @click="scrollToUserInfo()">
                                    <b>{{ this.activeChat.full_name !== '' ? this.activeChat.full_name : this.activeChat.phone }}</b>
                                </div>
                                <el-popover
                                    v-model="assignConvV"
                                    placement="right"
                                    width="400"
                                    trigger="click">
                                    <div class="p-3">
                                        <div>
                                            <div class="mb-2">
                                                <el-input
                                                    :placeholder="$t('search')"
                                                    v-model="searchAdmin">
                                                </el-input>
                                            </div>
                                            <div class="body">
                                                <div v-for="item in app.adminsTeams" @click="assignConversation(item.id)" v-if="item.id != activeChat.assigned_to  && (!searchAdmin || ((item.name).toLowerCase().includes(searchAdmin.toLowerCase())))" class="d-flex align-items-center p-2 rounded cursor_pointer bg-light-hover" >
                                                    <el-avatar size="medium" :src="item.profile_pic">
                                                        <img src="../images/view_photo.png"/>
                                                    </el-avatar>
                                                    <span class="ml-3">{{item.name}}</span>  
                                                    <i v-if="item.available && !item.isTeam" class="fa-solid fa-circle text-success fa-sm ml-2"></i>                                             
                                                </div>
                                            </div>                                            
                                        </div>
                                        <div>
                                            <button v-t="'removeAssgin'" type="button" :disabled="activeChat.assigned_to == 0" class="btn btn-outline-secondary btn-sm rounded w-100 mt-3" @click="assignConversation(0)"></button>
                                        </div>
                                    </div>  
                                    <p slot="reference" class="h7 my-0 text-secondary pointer txt_color_hover" type="info">
                                        <span v-t="'i.a_conversation'" v-if="activeChat.assigned_to == 0"></span>
                                        <span v-t="{ path: 'i.a_to', args: { n: getAdminInfo(activeChat.assigned_to, 'name') } }" v-else></span> 
                                        <i class="fa-light fa-angle-down"></i> 
                                    </p>

                                </el-popover>
                            </div>
                            
                           
                        </div>
                        <div class="">

                            <div class="d-flex">
                                <div class="d-block d-md-none p-0">
                                    <button id="btnGo1" class="btn btn-white px-2 px-md-3" @click="scrollToUserInfo()">
                                        <i class="fal fa-info-circle icon-lg"></i>
                                    </button>
                                </div>
                                <div class="d-flex align-items-center p-0">
                                    <el-tooltip class="item" effect="dark" :content="$t('f.msg3')" placement="top" v-if="activeChat.live_chat == 1">
                                        <button class="btn btn-white px-2 px-md-3" v-on:click="moveToOtherFolder(false)">
                                            <i class="fa-light fa-robot icon-lg"></i>
                                        </button>
                                    </el-tooltip>
                                    <el-tooltip v-if="activeChat.followup == 0" class="item" effect="dark" :content="$t('i.mAsFollUp')" placement="top">
                                        <button class="btn btn-white px-2 px-md-3" v-on:click="toggleFollowUp()">
                                            <i class="fal fa-star icon-lg"></i>
                                        </button>
                                    </el-tooltip>
                                    <el-tooltip v-else class="item" effect="dark" :content="$t('i.rFromFollUp')" placement="top">
                                        <button class="btn btn-white px-2 px-md-3" v-on:click="toggleFollowUp()">
                                            <i class="fa-solid fa-star icon-lg" style="color: #fab005"></i>
                                        </button>
                                    </el-tooltip>

                                </div>
                                <el-popover
                                    placement="bottom"
                                    trigger="click">
                                    <div class="item-action-c"> 
                                        <div v-if="activeChat.live_chat == 1" class="item-action" v-on:click="moveToOtherFolder(false)">  
                                            <i class="fa-light fa-robot icon-lg"></i>
                                            <span v-t="'f.msg3'"></span>
                                        </div>
                                        <div v-if="activeChat.followup == 0" class="item-action" v-on:click="toggleFollowUp()">  
                                            <i class="fa-solid fa-star icon-lg" style="color: #fab005"></i>
                                            <span v-t="'i.mAsFollUp'"></span>
                                        </div>
                                        <div v-else class="item-action" v-on:click="toggleFollowUp()">  
                                            <i class="fal fa-star icon-lg"></i>
                                            <span v-t="'i.rFromFollUp'"></span>
                                        </div>   

                                        <div class="item-action" v-on:click="markAsRead(false)">  
                                            <i class="fa-light fa-envelope icon-lg"></i>
                                            <span v-t="'i.mAsUnread'"></span>
                                        </div>
                                        <div v-if="activeChat.archived == 0" class="item-action" v-on:click="toggleArchived(1)">  
                                            <i class="fa-light fa-box-archive icon-lg"></i>
                                            <span v-t="'archive'"></span>
                                        </div>
                                        <div v-else class="item-action" v-on:click="toggleArchived(0)">  
                                            <i class="fa-light fa-box-open icon-lg"></i>
                                            <span v-t="'unarchive'"></span>
                                        </div>
                                        <div v-if="activeChat.blocked == 0" class="item-action" v-on:click="toggleBlocked(1)">  
                                            <i class="fa-light fa-user-lock icon-lg"></i>
                                            <span v-t="'block'"></span>
                                        </div>
                                        <div v-else class="item-action" v-on:click="toggleBlocked(0)">  
                                            <i class="fa-light fa-user-unlock icon-lg"></i>
                                            <span v-t="'unblock'"></span>
                                        </div>
                                        <div v-if="my_perm.mg_all == 1 || 1" class="item-action text-danger" v-on:click="preDeleteUser()">  
                                            <i class="fa-light fa-trash-can icon-lg text-danger"></i>
                                            <span class="text-danger" v-t="'delete_contact'"></span>
                                        </div> 
                                    </div> 
                                    <button slot="reference" class="btn btn-white px-2 px-md-3">  
                                            <i class="fal fa-ellipsis-v-alt icon-lg"></i>
                                    </button>                                     
                                </el-popover>                               
                            </div>

                        </div>
                    </div>
                    <div v-if="connecting" class="w-100 cursor_pointer text-center text-small bg-danger py-1 text-white d-flex justify-content-center align-items-center">
                        <span v-t="'i.msg6'"></span>
                    </div>
                    <el-tooltip class="item" effect="dark" :content="$t('f.msg2')" placement="top" v-else-if="activeChat.live_chat == 0">
                        <div v-on:click="moveToOtherFolder(true)" class="w-100 cursor_pointer text-center text-small bg-warning py-1 text-white d-flex justify-content-center align-items-center">
                            <i class="fa-light fa-robot icon-lg mr-2"></i>
                            <span v-t="'i.msg5'"></span>
                        </div>
                    </el-tooltip>                    
                    <div class="chat-area py-4 px-2" v-bind:class = "(activeChat.live_chat == 1)?'human':''"></element>

                        <div class="text-center py-2" v-if="loadingMessages">
                            <div class="spinner-border text-muted"></div>
                        </div>
                        
                        <!--<div v-for="m in activeChatMessages" v-if="m.channel == activeChat.channel && m.ms_id == activeChat.ms_id" v-bind:class="[from_user == m.from_user && from_context == m.from_context ? 'my-message' : 'other-message']">-->
                        <?php include("partial/chatarea.php") ?>

                    </div>

                    <div class="chat-input-c">   
                                          
                        <div class="chat-input pt-1 px-1" v-if="activeChat.blocked == 0">                           
                            <div v-if="replyingTo" class="replyingTo rounded d-flex justify-content-between align-items-center pl-3 py-1 mb-3 mt-1">
                                <div v-if="replyingTo.data.type =='image'" class="rounded">
                                    <img class="rounded" width="100px" height="auto" :src="replyingTo.data.url"/>
                                </div>
                                <div v-else class="text-muted h7">
                                    {{replyingTo.data.text}}
                                </div>  
                                <div class="py-2 px-3 btt-close" @click="replyingTo=null">
                                    <i class="fa-light fa-xmark"></i>
                                </div>                                
                            </div>

                            <div v-if="recording" class="text-center p-3">
                                <div class="spinner-grow text-secondary" role="status">
                                    <span v-t="'processing'" class="sr-only"></span>
                                </div>
                            </div>
                            <el-autocomplete v-else-if="sendType=='text'" class="input_no_style i_text w-100"
                                :disabled="!messageComposer"
                                type="textarea"
                                :autosize="{ minRows: 1, maxRows: 4}"
                                :trigger-on-focus="triggeSRonFocus"
                                popper-class="my-autocomplete"
                                v-model="message"
                                :fetch-suggestions="querySearch"
                                :placeholder="composerPlaceHolder"
                                :debounce="900"
                                @select="handleSelect"
                                @keydown.native="inputSendHandler">                               
                                <template slot-scope="{ item }">
                                    <div class="title">{{item.shortcode}}</div>                                    
                                    <span class="text-truncate">{{item.value}}</span>
                                </template>
                            </el-autocomplete>
                            <div v-else class="d-flex align-items-center pl-4 pr-2">
                                <div v-if="files[0].type == 'image'" class="rounded">
                                    <img width="150px" :src="files[0].previewURL"/>
                                </div>
                                <div v-else-if="files[0].type == 'audio' || files[0].type == 'voice'">
                                    <audio controls>
                                        <source v-bind:src="files[0].previewURL">
                                    </audio> 
                                </div>
                                <div v-else>
                                    <span>{{files[0].name}}</span>
                                </div>
                                <div class="ml-3 cursor_pointer bg-light-hover px-3 py-2" v-on:click="enableSendText()">
                                     <i class=" fal fa-times"></i>
                                </div>
                            </div>
                            <div class="d-flex justify-content-between align-items-center">
                                <el-dropdown @command="selectChatSendChannel" trigger="click">
                                    <span class="el-dropdown-link p-2 pointer">
                                        <i class="fa-xl" v-bind:class="[selectedSendChannel.icon]" v-bind:style="{ color: selectedSendChannel.color}"></i>
                                        <span class="ml-1 d-none d-lg-inline">{{selectedSendChannel.name}}</span>
                                    </span>
                                    <el-dropdown-menu slot="dropdown" class="noOverflow">
                                        <el-dropdown-item v-for="h in userChannels" v-bind:command="h" :disabled="(h.requirePhone == true && !activeChatInfo.phone) || h.disabled || h.id==15">
                                            <i v-bind:class="[h.icon]" v-bind:style="{ color: h.color}"></i>
                                            <span>{{h.name}}</span>
                                        </el-dropdown-item>
                                    </el-dropdown-menu>
                                </el-dropdown>
                                <div class="d-flex align-items-center"> 
                                    <el-popover v-if="!recording && sendType === 'text' && message === ''"
                                        v-model="moreOptionsVisible"
                                        popper-class=""
                                        placement="top"
                                        trigger="click">
                                        <div class="item-action-c"> 
                                            <div v-if="cur_page.whatsapp && activeChatInfo.whatsappChannel" class="item-action" v-on:click="moreOptionsVisible=false; preSendFlow('wa_template')">  
                                                <i class="fab fa-whatsapp"></i>
                                                <span v-t="'f.templateMessage'"></span>
                                            </div>
                                            <div class="item-action" v-on:click="moreOptionsVisible=false; preSendFlow('flow')">  
                                                <i class="fal fa-code-fork fa-rotate-90"></i>
                                                <span v-t="'send_flow'"></span>
                                            </div>
                                            <div v-if="messageComposer && products && products.length" class="item-action" v-on:click="moreOptionsVisible=false; sendProducts()">  
                                                <i class="fa-light fa-cart-shopping"></i>
                                                <span v-t="'sendProducts'"></span>
                                            </div>
                                            <div v-if="calendars && calendars.length" class="item-action" v-on:click="moreOptionsVisible=false; createAppointment('pre')">  
                                                <i class="fa-light fa-calendar-days"></i>
                                                <span v-t="'cal.createEvent'"></span>
                                            </div>
                                            <div v-if="messageComposer" class="item-action" @click.stop="moreOptionsVisible=false; showEmojiBox()">  
                                                <i class="fal fa-smile"></i>
                                                <span v-t="'i.iEmoji'"></span>
                                            </div>                                           
                                            <el-popover
                                                v-if="messageComposer"                                            
                                                v-model="savedReplyVisible"
                                                popper-class="popoverSR"
                                                placement="top"
                                                trigger="click">

                                                <div v-if="!newSavedReply.active">
                                                    <div class="d-flex align-items-center justify-content-between px-3 py-1 border-bottom">
                                                        <h5 v-t="'i.save_replies'" class="m-0"></h5>
                                                        <el-button v-t="'add_new'" type="text" @click="newSavedReply.active=true"></el-button>
                                                    </div>
                                                    <div class="py-2">
                                                        <div class="py-1 px-2" v-if="savedReplies.length > 5">
                                                            <input type="text" v-model="savedRepliesSearch" class="form-control search-box" :placeholder="$t('search')">
                                                        </div>
                                                        <div v-if="savedReplies.length" class="px-3 mx60vh o-v-auto">
                                                            <div v-for="(item, index) in savedReplies" v-if="(!savedRepliesSearch || item.shortcode.toLowerCase().includes(savedRepliesSearch.toLowerCase()))" class="d-flex justify-content-between align-items-center py-2 ">
                                                                <div class="w-100 cursor_pointer rounded bg-light-hover p-1" @click="selectReplyEdit(item)">
                                                                    <p class="mb-1"><b>{{item.shortcode}}</b></p>
                                                                    <div class="text-truncate m-0 value">{{item.value}}</div>
                                                                </div>
                                                                <div class="d-flex">
                                                                    <div class="bttIcon" @click="savedReplyEdit(item, index)">
                                                                        <i class="fal fa-pen"></i>
                                                                    </div>
                                                                    <div class="bttIcon"  @click="savedReplyDelete(item, index)">
                                                                        <i class="fal fa-trash-alt"></i>
                                                                    </div> 
                                                                </div>
                                                            </div>
                                                        </div>                                                
                                                        <div v-else class="px-3 p-3">
                                                            <div class="d-flex align-items-center py-5">
                                                                <div class="pr-3">
                                                                    <i class="fa-light fa-messages-question fa-2xl"></i>
                                                                </div>                                                        
                                                                <span v-t="'i.r_messages'"></span>    
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div v-else class="p-3">
                                                    <div>
                                                        <div class="form-group">
                                                            <label v-t="'shortcut'"></label>
                                                            <el-input v-model.trim="newSavedReply.shortcode" maxlength="100"></el-input>
                                                        </div>
                                                        <div class="form-group">
                                                            <label v-t="'messages'"></label>
                                                            <el-input type="textarea" :autosize="{ minRows: 2, maxRows: 5}" placeholder="..." v-model="newSavedReply.value" maxlength="3000"></el-input>
                                                        </div>
                                                    </div>
                                                    <div class="d-flex justify-content-between mt-2">
                                                        <button v-t="'cancel'" type="button" class="btn btn-outline-secondary btn-sm rounded" @click="savedReplyCancel"></button>
                                                        <button v-t="'save'" type="button" class="btn btn-primary btn-sm rounded" @click="savedReplySave"></button>
                                                    </div>
                                                </div>                                               
                                                <div slot="reference" class="item-action" v-on:click="moreOptionsVisible=false;">  
                                                    <i class="fal fa-comment-alt-dots"></i>
                                                    <span v-t="'i.iSavedRep'"></span>
                                                </div>                                           
                                            </el-popover>  
                                        </div>
                                        <div slot="reference" class="action bg-light-hover">
                                            <i class="fa-sharp fa-light fa-bars"></i>
                                        </div>                                             
                                    </el-popover>

                                    <el-tooltip v-if="messageComposer && message !== '' && !recording" :content="$t('i.iEmoji')" placement="bottom">
                                        <div class="action bg-light-hover" @click.stop="showEmojiBox()">
                                            <i class="fal fa-smile"></i>
                                        </div>
                                    </el-tooltip>

                                    <el-tooltip v-if="message=== '' && sendType === 'text' && !recording && messageComposer && savedReplies.length" :content="$t('i.iSavedRep')" placement="bottom">
                                        <el-popover
                                            v-model="savedReplyVisible1"
                                            popper-class="popoverSR"
                                            placement="top"
                                            trigger="click">

                                            <div v-if="!newSavedReply.active">
                                                <div class="d-flex align-items-center justify-content-between px-3 py-1 border-bottom">
                                                    <h5 v-t="'i.save_replies'" class="m-0"></h5>
                                                    <el-button v-t="'add_new'" type="text" @click="newSavedReply.active=true"></el-button>
                                                </div>
                                                <div class="py-2">
                                                    <div class="py-1 px-2" v-if="savedReplies.length > 5">
                                                        <input type="text" v-model="savedRepliesSearch" class="form-control search-box" :placeholder="$t('search')">
                                                    </div>
                                                    <div v-if="savedReplies.length" class="px-3 mx60vh o-v-auto">
                                                        <div v-for="(item, index) in savedReplies" v-if="(!savedRepliesSearch || item.shortcode.toLowerCase().includes(savedRepliesSearch.toLowerCase()))" class="d-flex justify-content-between align-items-center py-2 ">
                                                            <div class="w-100 cursor_pointer rounded bg-light-hover p-1" @click="selectReplyEdit(item)">
                                                                <p class="mb-1"><b>{{item.shortcode}}</b></p>
                                                                <div class="text-truncate m-0 value">{{item.value}}</div>
                                                            </div>
                                                            <div class="d-flex">
                                                                <div class="bttIcon" @click="savedReplyEdit(item, index)">
                                                                    <i class="fal fa-pen"></i>
                                                                </div>
                                                                <div class="bttIcon"  @click="savedReplyDelete(item, index)">
                                                                    <i class="fal fa-trash-alt"></i>
                                                                </div> 
                                                            </div>
                                                        </div>
                                                    </div>                                                
                                                    <div v-else class="px-3 p-3">
                                                        <div class="d-flex align-items-center py-5">
                                                            <div class="pr-3">
                                                                <i class="fa-light fa-messages-question fa-2xl"></i>
                                                            </div>                                                        
                                                            <span v-t="'i.r_messages'"></span>    
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div v-else class="p-3">
                                                <div>
                                                    <div class="form-group">
                                                        <label v-t="'shortcut'"></label>
                                                        <el-input v-model.trim="newSavedReply.shortcode" maxlength="100"></el-input>
                                                    </div>
                                                    <div class="form-group">
                                                        <label v-t="'messages'"></label>
                                                        <el-input type="textarea" :autosize="{ minRows: 2, maxRows: 5}" placeholder="..." v-model="newSavedReply.value" maxlength="3000"></el-input>
                                                    </div>
                                                </div>
                                                <div class="d-flex justify-content-between mt-2">
                                                    <button v-t="'cancel'" type="button" class="btn btn-outline-secondary btn-sm rounded" @click="savedReplyCancel"></button>
                                                    <button v-t="'save'" type="button" class="btn btn-primary btn-sm rounded" @click="savedReplySave"></button>
                                                </div>
                                            </div>
                                            <div slot="reference" class="action bg-light-hover">
                                                <i class="fal fa-comment-alt-dots"></i>
                                            </div>                                             
                                        </el-popover>
                                    </el-tooltip>


                                    
                                    
                               

                                    <el-tooltip v-if="message=== '' && sendType === 'text' && !recording && accountSettings && accountSettings.AIinboxReply && messageComposer" :content="$t('i.aiReply')" placement="bottom">
                                        <el-popover
                                            v-model="generateAI.visible"
                                            popper-class="popoverSR"
                                            placement="top"
                                            trigger="click">
                                            <div class="d-flex align-items-center justify-content-between px-3 py-1 border-bottom">
                                                <h5 v-t="'i.aiReply'" class="m-0"></h5>
                                                <div class="py-2 px-3 btt-close" @click="generateAI.visible = false">
                                                    <i class="fa-light fa-xmark"></i>
                                                </div>
                                            </div>
                                            <div v-if="generateAI.loading" class="p-5 text-center">
                                                <div class="spinner-grow my-4" role="status">
                                                    <span class="sr-only" data-v-t="'loading'"></span>
                                                </div>
                                            </div>
                                            <div v-else class="p-3">
                                                <div>
                                                   
                                                </div>                                                
                                                <div v-for="item in generateAI.results" class="d-flex justify-content-between mt-2 pointer text-primary-hover" @click="selectAIsuggestion(item)">
                                                    <span>{{item.text}}</span>
                                                </div>
                                            </div>
                                            <div slot="reference" class="action bg-light-hover" @click="generateAIreply()">
                                                <i class="fa-light fa-sparkles"></i>
                                            </div>                                             
                                        </el-popover>
                                    </el-tooltip>


                                    <el-tooltip v-if="recording" :content="$t('cancel')" placement="bottom">
                                        <div class="action bg-light-hover" v-on:click="cancelRecording">
                                            <i class="fa-light fa-xmark"></i>
                                        </div> 
                                    </el-tooltip> 

                                    <div v-if="message=== '' && sendType === 'text' && !recording && selectedSendChannel.sendVoice && messageComposer" class="action bg-light-hover" v-on:click="preSendAuido">
                                        <i class="fa-light fa-microphone"></i>
                                    </div> 
                                       

                                    
                                    <el-tooltip v-if="message=== '' && sendingFile" :content="$t('i.sFile')" placement="bottom">
                                        <div class="spinner-grow text-secondary" role="status">
                                            <span v-t="'processing'" class="sr-only"></span>
                                        </div>
                                    </el-tooltip>


                                    <el-popover v-if="message=== '' && sendType === 'text' && !recording && messageComposer"
                                        v-model="sendFileVisible"
                                        popper-class=""
                                        placement="top"
                                        trigger="click">
                                        <div class="item-action-c">                                           
                                            <el-upload
                                                :accept="selectedSendChannel.acceptFile"
                                                ref="uploadFile"
                                                show-file-list="false"
                                                :file-list="fileList"
                                                :on-change="fileChanged"
                                                http-request="sendFile"
                                                :auto-upload="false">
                                                <div slot="file"></div>
                                                <div slot="trigger" class="item-action" @click="sendFileVisible=false">   
                                                    <i class="fa-light fa-cloud-arrow-up"></i>
                                                    <span v-if="selectedSendChannel.sendFile" v-t="'uploadFile'"></span>  
                                                    <span v-else v-t="'uploadImage'"></span>   
                                                </div>
                                            </el-upload> 
                                            <div class="item-action" v-on:click="sendFileVisible=false; preSendFile()">  
                                                <i class="fa-light fa-photo-video"></i>
                                                <span v-t="'i.mediaLibrary'"></span>
                                            </div>     
                                        </div>
                                        <div slot="reference" class="action bg-light-hover">
                                            <i v-if="selectedSendChannel.sendFile" class="fal fa-paperclip"></i>
                                            <i v-else class="fal fa-light fa-image"></i>
                                        </div>     
                                    </el-popover>

                                    <el-date-picker v-if="message !== '' && sendType === 'text' && !recording && messageComposer"
                                        style="position: absolute; opacity: 0;pointer-events: none; width: 1px;"
                                        @change="scheduleMessage"
                                        value-format="timestamp"
                                        time-arrow-control
                                        :format="schedule.dateTimeFormat"
                                        ref="scheduleMpicker"
                                        v-model="schedule.time"
                                        type="datetime">
                                    </el-date-picker>

                                    <div v-if="schedule.loading" class="spinner-grow" role="status">
                                        <span class="sr-only" data-v-t="'loading'"></span>
                                    </div>
                                    <el-tooltip v-else-if="messageComposer && (message !== '' && sendType == 'text')" :content="$t('i.sendLater')" placement="bottom">
                                        <div class="action bg-light-hover" v-on:click="showSheduleMessagePicker">
                                            <i class="fa-light fa-clock"></i>
                                        </div> 
                                    </el-tooltip> 
                                    <div v-if="messageComposer && (message !== '' || recording || sendType !== 'text')" class="action bg-light-hover" v-on:click="sendMessage()">
                                        <i class="fa-light fa-paper-plane-top"></i>
                                    </div>
                                </div>
                            </div>
                            
                        </div>                     

                    </div>

                </div>

                </div>
                
            </div>

            <div v-if="chatMode == 'info' || chatMode == 'desktop'" class="col-12 col-md-3 h-device border border-top-0 border-right-0 border-bottom-0 py-2">
                
                <div v-if="activeChat">

                    <button class="btn d-inline-block d-md-none" id="btnBack2" @click="scrollToChat()">
                        <i class="fal fa-chevron-left icon-lg"></i>
                    </button>

                    <div class="img-profile-wrapper img-profile-wrapper-big mx-auto">
                        <div class="img-profile img-profile-big">
                            <img v-bind:src="activeChat.profile_pic" onerror="this.src = '../images/view_photo.png'">
                        </div>
                        <i class="channel" v-bind:class="[h.icon]" v-if="activeChat.channel == h.id"  v-for="h in channels" v-bind:style="{ color: h.color}"></i>
                    </div>

                    <div class="text-center py-2" v-if="loadingChatInfo">
                        <div class="spinner-border text-muted"></div>
                    </div>
                    <div v-else>
                        <el-popover
                            v-model="userRenameP"
                            placement="bottom"
                            width="300"
                            trigger="click">
                            <div class="item-action-c">
                                <a class="item-action"  v-bind:href="'user-info?id=' + activeChatInfo.ms_id + '&acc=' + cur_page.page_id" target="blank">
                                    <i class="fa-light fa-circle-info"></i>
                                    <span v-t="'moreInfo'"></span>
                                </a>
                                <a class="item-action" @click="renameContact()">
                                    <i class="fal fa-text"></i>
                                    <span v-t="'rename'"></span>
                                </a>
                            </div>   
                            <div slot="reference" class="info p-2 mr-1">
                                <p class="text-center mt-3 mb-1 t-p-h">
                                    <u v-if="activeChatInfo.full_name.trim()"><b>{{ activeChatInfo.full_name }}</b></u>
                                    <u v-else-if="activeChatInfo.first_name.trim()"><b>{{ activeChatInfo.first_name}}</b></u>
                                    <b v-else>---------</b>
                                </p>
                            </div>
                        </el-popover>
                        <p class="text-center" v-if="activeChatInfo.ig_username">
                                <a v-bind:href="'https://www.instagram.com/' + activeChatInfo.ig_username" target="_BLANK" class="text-secondary">
                                    <i v-if="activeChatInfo.channel != 10" class="fa-brands fa-instagram w30 text-center"></i>
                                    @{{ activeChatInfo.ig_username }}
                                </a>
                                <el-tooltip  effect="dark" :content="$t('verified')" placement="top">
                                    <i v-if="activeChatInfo.ig_verified == 1" class="ml-1 fa-solid fa-badge-check text-success"></i>
                                </el-tooltip>
                        </p> 
                        <p class="text-center h7 text-secondary" v-if="activeChatInfo.business_id" v-t="'businessMessage'"></p> 

                        <div class="mt-3 mb-4" v-if="data.wt && data.wt.jobs">
                            <div class="mb-1">Applied Jobs</div>
                            <div v-if="!swimLineInfo.useSwimLine">
                                <el-select multiple :placeholder="$t('select')" v-model="activeChatInfo.jobs" class="w-100" @remove-tag="removeJob" @change="changeJob">
                                    <el-option
                                        v-for="t in jobs"
                                        :key="t.id"
                                        :label="t.name"
                                        :value="t.id">
                                    </el-option>
                                </el-select>
                            </div>
                            <div v-else>
                                <el-cascader class="w-100 mb-2" v-for="item in activeChatInfo.swimlines"
                                    popper-class="hideDisabled"
                                    :props="{ multiple: true, checkStrictly: true, emitPath: true}"
                                    :clearable="false"                                    
                                    v-model="item.value" 
                                    :options="item.data"
                                    @change="swimLaneChanged(item)">
                                    <template slot-scope="{ node, data }">
                                        <span>{{ data.label }}</span>
                                    </template>
                                </el-cascader>
                            </div>                            
                        </div>

                        <div class="pt-3">
                            <p v-if="activeChatInfo.gender != 2 && 0" class="my-2 text-secondary" :title="$t('gender')">
                                <i class="fal fa-female w30 text-center" v-if="activeChatInfo.gender == 0"></i>
                                <i class="fal fa-male w30 text-center" v-else-if="activeChatInfo.gender == 1"></i>
                                <i class="fal fa-genderless w30 text-center" v-else></i>
                                {{ gender_tostring(activeChatInfo.gender) }}
                            </p>

                            <p class="my-2 text-secondary hide" :title="$t('language')">
                                <i class="fal fa-globe w30 text-center"></i>
                                {{ lng_tostring(activeChatInfo.lng) }}
                            </p>
                           
                            <p class="my-2 hide" v-if="activeChatInfo.email">
                                <a v-bind:href="'mailto: ' + activeChatInfo.email" target="_BLANK" class="text-secondary">
                                    <i class="fal fa-at w30 text-center"></i>
                                    {{ activeChatInfo.email }}
                                </a>
                                <el-tooltip  effect="dark" :content="$t('verified')" placement="top">
                                    <i v-if="activeChatInfo.email_verified==1" class="ml-1 fa-solid fa-badge-check text-success"></i>
                                </el-tooltip>
                            </p>

                          
                            <div v-for="(item, index) in activeChatInfo.custom_fields" v-if="item.name !== undefined" class="d-flex p-1">
                                <div class="d-flex col-5 p-0">
                                    <div>
                                        <i v-if="item.icon" class="w30" :class="item.icon"></i>
                                        <i v-else-if="item.id == -12" class="fa-thin fa-at w30"></i>
                                        <i v-else-if="item.id == -8" class="fa-thin fa-phone w30"></i>
                                        <i v-else-if="item.id == -54 || item.id == -55 || item.id == -56 || item.id == -57" class="fa-thin fa-earth-americas w30"></i>
                                        <i v-else-if="item.type == 0 || item.type == 5" class="fa-thin fa-text w30"></i>
                                        <i v-else-if="item.type == 1" class="fa-thin fa-hashtag w30"></i>
                                        <i v-else-if="item.type == 2 || item.type == 3" class="fa-thin fa-calendar w30"></i>
                                        <i v-else-if="item.type == 4 && item.value == 1" class="fa-thin fa-square-check w30"></i>
                                        <i v-else-if="item.type == 4" class="fa-thin fa-square w30"></i>
                                    </div>
                                    <el-tooltip open-delay="1000" effect="dark" :content="item.name" placement="top">
                                        <span class="text-secondary h7 d-inline-block text-truncate w-100">{{item.name}}</span>
                                    </el-tooltip>
                                </div>
                                <div class="col-7 py-0 pr-0 pl-2">
                                    <div v-if="!item.id || item.editing === null">
                                        <span v-if="item.type == 1 || item.type == 4 || item.value === ''" class="text-secondary h7 d-inline-block text-truncate w-100">{{item.formatedValue !== undefined ? item.formatedValue : item.value}} <i v-if="item.id==-12 && activeChatInfo.email_verified==1 || item.id==-8 && activeChatInfo.phone_verified==1" class="ml-1 fa-solid fa-badge-check text-success"></i></span>
                                        <el-tooltip v-else effect="dark" open-delay="1000" :content="item.formatedValue !== undefined ? item.formatedValue : item.value" placement="top">
                                            <span class="text-secondary h7 d-inline-block text-truncate w-100">{{item.formatedValue !== undefined ? item.formatedValue : item.value}} <i v-if="item.id==-12 && activeChatInfo.email_verified==1 || item.id==-8 && activeChatInfo.phone_verified==1" class="ml-1 fa-solid fa-badge-check text-success"></i></span>
                                        </el-tooltip>
                                    </div>
                                    <el-popover v-else
                                        v-model="item.editing"
                                        placement="bottom"
                                        width="360"
                                        trigger="click"
                                        v-on:show="startEditCFields(item)">
                                        <div v-if="item.editing">
                                            <div class="d-flex justify-content-between align-items-center py-2 px-3">
                                                <div></div>
                                                <div class="blod">{{item.name}}</div>
                                                <div class="py-2 px-3 btt-close" @click="item.editing = false">
                                                    <i class="fa-light fa-xmark"></i>
                                                </div>
                                            </div>
                                            <div class="py-4 border-top px-3 d-flex justify-content-center">
                                                <el-input type="textarea" :rows="2" v-if="item.type == 0 || item.type == 5 || item.id==-12 || item.id==-8" v-model="editField.value" :placeholder="item.hint? item.hint : ''"></el-input>
                                                <el-input-number class="w-100" v-else-if="item.type == 1 || item.id == -62" v-model="editField.value"></el-input-number>
                                                <el-date-picker align="right" v-else-if="item.type == 2" value-format="timestamp" v-model="editField.value" type="date" :placeholder="$t('select')"></el-date-picker>
                                                <el-date-picker align="right" v-else-if="item.type == 3" value-format="timestamp" v-model="editField.value" type="datetime" placeholder="$t('select')"></el-date-picker>
                                                <el-checkbox  v-else="item.type == 4" v-model="editField.value">{{item.name}}</el-checkbox>
                                            </div>
                                            <div class="d-flex border-top px-3 py-2 justify-content-between w-100"> 
                                                <button v-t="'delete'" type="button" class="btn btn-danger nagative" @click="unsetCustomField(item, index)"></button>
                                                <button v-t="'save'" type="button" class="btn btn-primary positive" @click="editCFields(item)"></button>
                                            </div>
                                        </div>
                                        <span v-if="item.type == 1 || item.type == 4 || item.value === ''" slot="reference" class="t-p-h text-secondary h7 d-inline-block text-truncate w-100">{{item.formatedValue !== undefined ? item.formatedValue : item.value}} <i v-if="item.id==-12 && activeChatInfo.email_verified==1 || item.id==-8 && activeChatInfo.phone_verified==1" class="ml-1 fa-solid fa-badge-check text-success"></i></span>
                                        <el-tooltip v-else slot="reference" effect="dark" open-delay="1000" :content="item.formatedValue !== undefined ? item.formatedValue : item.value" placement="top">
                                            <span class="text-secondary h7 d-inline-block text-truncate w-100 t-p-h">{{item.formatedValue !== undefined ? item.formatedValue : item.value}} <i v-if="item.id==-12 && activeChatInfo.email_verified==1 || item.id==-8 && activeChatInfo.phone_verified==1" class="ml-1 fa-solid fa-badge-check text-success"></i></span>
                                        </el-tooltip>
                                    </el-popover>
                                    
                                </div>
                            </div>
                            <div>
                                <el-popover    
                                    v-model="editField.chooseCF.active"                                        
                                    placement="top"
                                    trigger="click">

                                    <div v-if="editField.chooseCF.step == 'select'">
                                        <div class="d-flex align-items-center justify-content-between px-3 py-1 border-bottom">
                                            <h5 v-t="'c_fields'" class="m-0 mr-4"></h5>
                                            <el-button v-t="'add_new'" type="text" @click="editField.chooseCF.step = 'add'"></el-button>
                                        </div>
                                        <div class="py-2">
                                            <div class="py-1 px-2" v-if="activeChatInfo.customFieldsNovalue.length > 5">
                                                <input type="text" v-model="editField.search" class="form-control search-box" :placeholder="$t('search')">
                                            </div>
                                            <div class="px-3 mx60vh o-v-auto">
                                                <div v-for="(item, index) in activeChatInfo.customFieldsNovalue"  @click="startEditCFields(item, index)" class="d-flex align-items-center px-3 py-2 btn-my" v-if="item.inbox && (!editField.search || item.name.toLowerCase().includes(editField.search))">
                                                    <i v-if="item.type == 0" class="fa-thin fa-text w30"></i>
                                                    <i v-else-if="item.type == 1" class="fa-thin fa-hashtag w30"></i>
                                                    <i v-else-if="item.type == 2 || item.type == 3" class="fa-thin fa-calendar w30"></i>
                                                    <i v-else-if="item.type == 4" class="fa-thin fa-square-check w30"></i>
                                                    <span class="mr-2">{{item.name}}</span>
                                                </div>
                                            </div>  
                                        </div>
                                    </div> 
                                    <div v-else-if="editField.chooseCF.step == 'add'">
                                        <div class="d-flex align-items-center justify-content-between px-3 py-1 border-bottom">
                                            <div class="p-2 t-p-h" @click="editField.chooseCF.step = 'select'">
                                                <i class="fa-light fa-arrow-left"></i>
                                            </div>                                            
                                            <h5 v-t="'add_new'" class="m-0 mr-4"></h5>
                                            <div></div>
                                        </div>
                                        <div class="p-3">
                                            <div class="form-group">
                                                <label v-t="'type'"></label>
                                                <el-select v-model="editField.chooseCF.type">
                                                    <el-option  :label="$t('text')" value="0"></el-option>
                                                    <el-option  :label="$t('number')" value="1"></el-option>
                                                    <el-option  :label="$t('date')" value="2"></el-option>
                                                    <el-option  :label="$t('dateTime')"  value="3"></el-option>
                                                    <el-option  :label="$t('trueFalse')" value="4"></el-option>
                                                </el-select>
                                            </div>
                                            <div class="form-group">
                                                <label v-t="'name'"></label>
                                                <el-input v-model="editField.chooseCF.name" maxlength="100"></el-input>
                                            </div>
                                        </div>
                                        <div class="d-flex border-top px-3 py-2 justify-content-between w-100"> 
                                            <button v-t="'cancel'" type="button" class="btn btn-outline-secondary" @click="editField.chooseCF.active = false"></button>
                                            <button v-t="'continue'" type="button" class="btn btn-primary positive" @click="startEditCFields(null)"></button>
                                        </div>                                       
                                    </div> 
                                    <div v-else class="p-5 text-center">
                                        <div class="spinner-grow" role="status">
                                            <span class="sr-only" data-v-t="'loading'"></span>
                                        </div>
                                    </div>                                         
                                    <div slot="reference" class="mt-2 d-flex align-items-center p-1 btn-my">
                                        <i class="fa-thin fa-plus w30"></i>
                                        <span class="text-secondary h7 d-inline-block" v-t="'add_new'"></span>
                                    </div>                                             
                                </el-popover>
                            </div>
                        </div>

                        

                        <div class="mt-5" v-if="userAppointments && userAppointments.next && userAppointments.next.length">
                            <div class="mb-3" v-t="'cal.bookings'"></div>
                            <a v-for="item in userAppointments.next" class="d-flex align-items-center mb-3" target="blank" :href="item.eventLink">
                                <i class="fa-thin fa-calendar-days fa-2xl text-secondary"></i> 
                                <div class="ml-3">
                                    <p class="mb-1">{{item.dateFormated}}</p>
                                    <p class="text-secondary m-0 text-small">{{item.calendar.name}}</p>
                                </div>                            
                            </a>
                        </div>

                        <div class="mt-5" v-if="boards.length">
                            <div class="mb-3 d-flex align-items-center justify-content-between">
                                <div>{{$t('boards')}} <span v-if="activeChatInfo.boards.length">({{activeChatInfo.boards.length}})</span></div>
                                <el-button v-if="boards.length == 1" v-t="'add_new'" type="text" @click="addCard(boards[0].id)"></el-button>
                                <div v-else>
                                    <el-popover
                                        placement="bottom"
                                        trigger="click">
                                        <div class="p-3">
                                            <div class="form-group">
                                                <label v-t="'board'"></label>
                                                <el-select :placeholder="$t('select')" v-model="board_id" class="w-100" filterable>
                                                    <el-option
                                                        v-for="item in boards"
                                                        :key="item.id"
                                                        :label="item.name"
                                                        :value="item.id">
                                                    </el-option>
                                                </el-select>
                                            </div>
                                            <el-button v-if="board_id" class="w-100" v-t="'continue'" @click="addCard(board_id)"></el-button>
                                        </div> 
                                        <el-button slot="reference" v-t="'add_new'" type="text" size="medium"></el-button>
                                    </el-popover> 
                                </div>
                            </div>
                            
                            <transition name="el-zoom-in-top" v-for="(c, cardIdx) in activeChatInfo.boards" v-if="c.board">
                            <div class="btn btn-white border rounded mb-3 w-100" v-show="cardIdx < 4 || showBoardCards" @click="editCard(c, null, cardIdx)">
                                <div class="d-flex justify-content-between align-items-center py-2">
                                    <div class="text-left">
                                        <p class="m-0">{{c.board.name}}</p>
                                        <p class="m-0 text-secondary">{{c.stage.name}}</p>
                                    </div>
                                    <div>
                                        <el-popover
                                            v-model="c.options"
                                            placement="bottom"
                                            trigger="click">
                                            <div class="item-action-c">
                                                <div v-if="c.board.myPerm.edit_cards" class="item-action-menu">  
                                                    <i class="fa-light fa-arrow-right"></i>
                                                    <span v-t="'moveTo'"></span>
                                                </div>
                                                <div v-if="c.board.myPerm.edit_cards" class="pl-3 border-bottom">
                                                    <div v-for="(item, idx) in c.board.data.stages" v-if="c.stage_id != item.id" class="item-action" @click="boardChangeCardStage(c, item)">
                                                        <i class="fa-light fa-rectangle-vertical"></i>
                                                        <span>{{item.name}}</span>                                                            
                                                    </div>
                                                </div>
                                                <div v-if="c.board.myPerm.delete_cards" class="item-action text-danger" v-on:click="boardRemoveCard(c)">  
                                                    <i class="fa-light fa-trash-can icon-lg text-danger"></i>
                                                    <span class="text-danger" v-t="'delete'"></span>
                                                </div> 
                                            </div> 
                                            <button slot="reference" class="btn btn-white px-2 color-primary-hover" @click.stop="">  
                                                    <i class="fal fa-ellipsis-v-alt icon-lg"></i>
                                            </button>                                     
                                        </el-popover> 
                                    </div>
                                </div>
                                <div class="w-100 text-left pb-2 pt-3 border-top">
                                    <p>{{c.title}}</p>
                                    <div class="d-flex justify-content-between mt-1">
                                        <div>
                                            <span class="text-secondary" v-if="c.board.settings.card.id">#{{c.card_id}}</span>
                                        </div>
                                        <b v-if="c.board.settings.value && c.board.settings.card.value">{{c.valueFormatted}}</b>
                                    </div>                                                
                                </div>
                                <div class="w-100 border-top d-flex justify-content-between align-items-center pt-2">
                                    <div>
                                        <div class="admin-circles" v-if="c.board.settings.card.assignedAdmins && c.admins.ids" >
                                            <div v-for="(admin, idx) in c.admins.data" v-if="idx < 2">
                                                <el-tooltip  effect="dark" :content="admin.name" placement="top">
                                                    <div v-if="admin.profile_pic" class="admin-circle" :style="{backgroundImage: 'url('+admin.profile_pic+')'}"></div>
                                                    <div v-else class="admin-circle no-image ">{{admin.startLetter}}</div>
                                                </el-tooltip>                                                            
                                            </div>
                                            <div v-if="c.admins.ids.length > 2" class="admin-circle extra">+{{c.admins.ids.length - 2}}</div>
                                        </div>                                                
                                    </div>
                                    
                                    <div class="d-flex align-items-center">                                                    
                                        <el-tooltip  effect="dark" :content="c.createdAtFormatted" placement="top" v-if="c.board.settings.card.createdDate">
                                            <div class="d-flex align-items-center rounded px-2 py-1 text-secondary mr-2">
                                                <i class="fa-light fa-clock mr-1"></i>
                                                <span class="h7">{{c.created_at_short}}</span>
                                            </div>
                                        </el-tooltip> 
                                        <el-tooltip  effect="dark" :content="$t('comments')" placement="top" v-if="c.board.settings.card.totalComments">
                                            <div class="d-flex align-items-center  rounded px-2 py-1 text-secondary">
                                                <i class="fa-light fa-comment-dots mr-1"></i>
                                                <span class="h7">{{c.total_comments}}</span>
                                            </div>
                                        </el-tooltip>
                                        <div v-if="c.board.settings.card.priority">
                                            <el-tooltip v-if="c.priority == 0"  effect="dark" :content="$t('lowP')" placement="top">
                                                <div class="px-2 py-1">
                                                    <i class="fa-solid fa-flag text-success"></i>
                                                </div>
                                            </el-tooltip>
                                            <el-tooltip v-else-if="c.priority == 1"   effect="dark" :content="$t('mediumP')" placement="top">
                                                <div class="px-2 py-1">
                                                    <i class="fa-solid fa-flag text-warning"></i>
                                                </div>
                                            </el-tooltip>
                                            <el-tooltip v-else effect="dark" :content="$t('highP')" placement="top">
                                                <div class="px-2 py-1">
                                                    <i class="fa-solid fa-flag text-danger"></i>
                                                </div>
                                            </el-tooltip>
                                        </div>
                                       
                                    </div>                                                                                                
                                </div>    
                            </div>
                            </transition>
                            <div v-if="activeChatInfo.boards.length > 4 && !showBoardCards" class="text-center">
                                <button type="button" class="btn btn-link text-secondary" @click="showBoardCards=true" v-t="'viewMore'"></button>
                            </div>
                        </div>

                        <div class="mt-5" v-if="userOrders && userOrders.length">
                            <div class="mb-3">{{$t('orders')}} ({{userOrders.length}})</div>
                            <transition name="el-zoom-in-top" v-for="(item, index) in userOrders" >
                                <div v-show="index < 4 || showAllOrders">
                                    <a  class="d-flex align-items-center mb-3" target="blank" :href="item.link">
                                        <i class="fa-sharp fa-thin fa-cart-circle-check fa-2xl text-secondary"></i> 
                                        <div class="ml-3">
                                            <p class="mb-1">{{cur_page.coin + numberWithSpaces(item.final_price)}}</p>
                                            <p class="text-secondary m-0 h7">{{UTC_to_local_strdate(item.dt_confirmed)}}</p>
                                            <p class="text-secondary m-0 h7">{{order_state(item.cart_state, 1)}}</p>
                                        </div>                            
                                    </a>
                                </div>                                
                            </transition>
                            <div v-if="userOrders.length > 4 && !showAllOrders" class="text-center">
                                <button type="button" class="btn btn-link text-secondary" @click="showAllOrders=true" v-t="'viewMore'"></button>
                            </div>
                            
                        </div>

                        <div class="mt-5">
                            <div>{{$t('i.notes')}} ({{activeChatInfo.notes ? 0 : activeChatInfo.notes.length}})</div>
                            <div v-if="!newNote.active" class="px-2">
                                <div class="border-bottom py-2" v-for="(item, index) in activeChatInfo.notes">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <el-tooltip  effect="dark" :content="getAdminInfo(item.own, 'name')" placement="top">
                                            <div class="d-flex align-items-center" >
                                                <el-avatar size="small" :src="getAdminInfo(item.own, 'picture')"></el-avatar>
                                                <span class="ml-2">{{timestamp_to_local_str(item.u_dt, 'YYYY-MM-DD HH:mm')}}</span>
                                            </div>
                                        </el-tooltip>
                                        

                                        <div class="d-flex">
                                            <el-tooltip  effect="dark" :content="$t('edit')" placement="top">
                                                <div class="bttIcon" @click="noteEdit(item, index)">
                                                    <i class="fal fa-pen"></i>
                                                </div>
                                            </el-tooltip>
                                            <el-tooltip  effect="dark" :content="$t('delete')" placement="top">
                                                <div class="bttIcon"  @click="noteDelete(item, index)">
                                                    <i class="fal fa-trash-alt"></i>
                                                </div>
                                            </el-tooltip> 
                                        </div>
                                    </div>
                                    <div>
                                        <pre class="text-secondary">{{item.text}}</pre>
                                    </div>
                                </div>
                                <button type="button" class="btn btn-outline-secondary btn-sm rounded w-100 mt-3" @click="newNote.active=true" v-t="'add_new'"></button>
                            </div>
                            <div v-else>
                                <el-input type="textarea" :autosize="{ minRows: 2, maxRows: 5}" placeholder="..." v-model="newNote.text" maxlength="2000" show-word-limit></el-input>
                                <div class="d-flex justify-content-between mt-2">
                                    <button type="button" class="btn btn-outline-secondary btn-sm rounded" @click="noteCancel" v-t="'cancel'"></button>
                                    <button type="button" class="btn btn-primary btn-sm rounded" @click="noteSave" v-t="'save'"></button>
                                </div>
                            </div>
                        </div>
                                
                        

                        <el-collapse class="mt-4" @change="infoPanelsChanged"> 
                            <el-collapse-item :title="$t('i.msg22')" name="attachments">
                                <div v-if="activeChatInfo.attachments.images === null" class="text-center py-2">
                                    <div class="spinner-grow text-muted"></div>
                                </div>
                                <div v-else>
                                    <el-tabs value="files">
                                        <el-tab-pane :label="$t('files') + ' ('+activeChatInfo.attachments.files.length+')'" name="files">
                                            <div v-if="!activeChatInfo.attachments.files.length" class="text-center text-muted" v-t="'noResults'"></div>
                                            <div v-else>
                                                <div v-for="file in activeChatInfo.attachments.files" class="pr-2 py-2 border-bottom d-flex align-items-center pointer" @click="open_link(file.url, 1)">
                                                    <div class="p-2">
                                                        <i class="fa-light fa-file fa-xl text-secondary"></i>
                                                    </div>   
                                                    <div class="ml-2 w-100">
                                                        <span class="mb-0 small-line h7 d-inline-block text-truncate w-80">{{file.name}}</span>
                                                        <span class="d-block mb-0 text-muted text-small small-line h7 hide">{{file.strSize}}</span>
                                                    </div>                                                 
                                                </div>
                                            </div>
                                            
                                        </el-tab-pane>
                                        <el-tab-pane :label="$t('images') + ' ('+activeChatInfo.attachments.images.length+')'" name="images">
                                            <div v-if="!activeChatInfo.attachments.images.length" class="text-center text-muted" v-t="'noResults'"></div>
                                            <div v-else class="d-flex flex-wrap">
                                                <div v-for="file in activeChatInfo.attachments.images" class="mb-1 mr-1 bolder rounded">
                                                    <el-tooltip effect="dark" :content="file.info" placement="top">
                                                        <div>
                                                            <el-image fit="cover"  :src="file.url" :preview-src-list="[file.url]" style="width: 80px; height: 80px;" class="rounded"></el-image>
                                                        </div>
                                                    </el-tooltip>                                                    
                                                </div>
                                            </div>     
                                        </el-tab-pane>
                                        <el-tab-pane :label="$t('videos') + ' ('+activeChatInfo.attachments.videos.length+')'" name="videos">
                                            <div v-if="!activeChatInfo.attachments.videos.length" class="text-center text-muted" v-t="'noResults'"></div>
                                            <div v-else class="d-flex flex-wrap">
                                                <div v-for="file in activeChatInfo.attachments.videos" class="mb-1 mr-1 bolder rounded">
                                                    <el-tooltip effect="dark" :content="file.info" placement="top">
                                                        <div v-if="file.type == 'video'">
                                                            <video controls preload="metadata" style="width: 150px; height: 150px;">
                                                                <source v-bind:src="file.url+'#t=0.1'">
                                                            </video>
                                                        </div>
                                                    </el-tooltip>                                                    
                                                </div>
                                            </div>    
                                        </el-tab-pane>
                                    </el-tabs>   
                                </div>
                            </el-collapse-item> 
                            <el-collapse-item :title="$t('tags')" name="tags">
                                <el-select multiple :placeholder="$t('select')" v-model="activeChatInfo.tags" class="w-100" @remove-tag="removeTag" allow-create filterable @change="addTag">
                                    <el-option
                                        v-for="t in tags"
                                        :key="t.id"
                                        :label="t.name"
                                        :value="t.id">
                                    </el-option>
                                </el-select>
                            </el-collapse-item>
                           
                            <el-collapse-item v-if="sequences && sequences.length" :title="$t('i.subSequences')" name="sequences">
                                <el-select multiple :placeholder="$t('select')" v-model="activeChatInfo.sequences" class="w-100" @remove-tag="removeSequence" @change="changeSequence">
                                    <el-option
                                        v-for="t in sequences"
                                        :key="t.id"
                                        :label="t.name"
                                        :value="t.id">
                                    </el-option>
                                </el-select>

                            </el-collapse-item>


                        </el-collapse>

                        <div class="mt-3" v-if="my_perm.t == 2">
                            <el-checkbox v-model="viewActions" @change="reloadMessage">{{$t('i.msg12')}}</el-checkbox>
                        </div>
                        
                    </div>

                </div>

            </div>
        </div>

       

        <div id="sendFlowModal" class="modal fade">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header hide">
                        <div class="invisible"></div>
                        <h5 v-t="'send_flow'" class="modal-title"></h5>       
                        <div class="modal-dismiss" data-dismiss="modal" aria-label="Close">
                            <i class="fal fa-times"></i>  
                        </div>
                    </div>
                    <div class="modal-body mx75vh o-v-auto mx-0" v-if="cur_page && sendContent" :class="sendContent.type == 'wa_template' ? 'model-suggest' : ''">
                        <template>
                            <el-tabs v-model="sendContent.type">
                                <el-tab-pane :label="$t('flows')" name="flow" v-if="sendContent.type != 'wa_template'">
                                    <div v-if="!sendContent.flow.flow">
                                        <div class="py-1 mb-2" v-if="pageFlows.length > 5">
                                            <input type="text" v-model="sendContent.flow.search" class="form-control search-box" :placeholder="$t('search')">
                                        </div>
                                        <div v-for="item in pageFlows" class="w-100 d-flex justify-content-between align-items-center px-3 py-3 border-top" v-if="item.inbox == 1 && (item.channel == -1 || getItemName(userChannels, item.channel)) && (sendContent.flow.search === '' || item.d.toLowerCase().includes(sendContent.flow.search.toLowerCase()))">
                                            <div style="max-width: calc(100% - 70px)" class="d-flex align-items-center">
                                                <i v-if="item.channel == -1" class="fa-xl fal fa-dice-d20"></i>
                                                <i v-else class="fa-xl" :class="getItemName(channels, item.channel, ['id','icon'])"></i>
                                                <div class="ml-3 text-truncate">
                                                    {{item.d}}
                                                </div>
                                            </div>
                                            <div class="p-2 c_pointer" v-if="item.channel == -1 && userChannels.length > 1" v-on:click="sendContent.flow.flow = item">
                                                <i class="fa-light fa-chevrons-right fa-lg"></i>
                                            </div>
                                            <div v-else class="p-2 c_pointer" v-on:click="sendFlow(item, item.channel)">
                                                <i class="fa-light fa-paper-plane-top fa-lg"></i>
                                            </div>
                                        </div>
                                    </div>
                                    <div v-else>
                                        <div class="d-flex align-items-center p-2 c_pointer mb-2" v-on:click="sendContent.flow.flow = null">
                                            <i class="fa-light fa-arrow-left mr-3"></i> 
                                            <span v-t="'selectChannel'"></span>                                           
                                        </div>

                                        <div v-for="item in userChannels" class="w-100 d-flex justify-content-between align-items-center px-3 py-3 border-top" v-if="item.channel != 15">
                                            <div style="max-width: calc(100% - 70px)" class="d-flex align-items-center">
                                                <i v-if="item.channel == -1" class="fa-xl fal fa-dice-d20"></i>
                                                <i v-else class="fa-xl" :class="item.icon"></i>
                                                <div class="ml-3 text-truncate">
                                                    {{item.name}}
                                                </div>
                                            </div>
                                            <div class="p-2 c_pointer" v-on:click="sendFlow(sendContent.flow.flow, item.id)">
                                                <i class="fa-light fa-paper-plane-top fa-lg"></i>
                                            </div>
                                        </div>                                           
                                    </div> 

                                </el-tab-pane>
                                <el-tab-pane v-if="cur_page.whatsapp && activeChatInfo.whatsappChannel"  :label="$t('f.templateMessage')" name="wa_template" v-if="sendContent.type == 'wa_template'">
                                    
                                    <div v-if="!sendContent.waTemplate.template">
                                        <div class="py-1 mb-2" v-if="waTemplateNames.length > 5">
                                            <input type="text" v-model="sendContent.waTemplate.search" class="form-control search-box" :placeholder="$t('search')">
                                        </div>
                                        <div v-for="item in waTemplateNames" class="w-100 d-flex justify-content-between align-items-center px-3 py-3 border-top" v-if="sendContent.waTemplate.search === '' || item.name.toLowerCase().includes(sendContent.waTemplate.search.toLowerCase())">
                                            <div style="max-width: calc(100% - 70px)" class="ml-3 text-truncate">
                                                {{item.name}}
                                            </div>
                                            <div class="p-2 c_pointer" v-on:click="sendContent.waTemplate.id = item.id; onSendContenChange('name')">
                                                <i class="fa-light fa-chevrons-right fa-lg"></i>
                                            </div>
                                        </div>
                                    </div>
                                
                                    <div class="d-flex justify-content-between align-items-center mb-3">
                                        <div v-if="sendContent.waTemplate.template" class="p-2 c_pointer" v-on:click="sendContent.waTemplate.template = null">
                                            <i class="fa-light fa-arrow-left mr-3"></i>                                  
                                        </div>

                                        <div v-if="sendContent.waTemplate.template && sendContent.waTemplate.subData.length > 1" class="mx-auto text-center">
                                            <el-radio-group v-model="sendContent.waTemplate.subID" size="small" v-on:change="onSendContenChange('language')">
                                                <el-radio-button v-for="item in sendContent.waTemplate.subData" :label="item"></el-radio-button>
                                            </el-radio-group>
                                        </div>
                                        <div></div>
                                    </div>
                                    

                                    <div v-if="sendContent.waTemplate.template">                                   
                                    
                                        <div class="z-depth-2 rounded p-4 my-4">

                                            <div v-if="sendContent.waTemplate.template.components.header">
                                                
                                                <div v-if="sendContent.waTemplate.template.components.header.format != 'TEXT'">
                                                    <div v-if="sendContent.loading" class="w-100 text-center p-4">
                                                        <div class="spinner-grow text-muted"></div>
                                                    </div>
                                                    <div class="my-4" v-else-if="sendContent.waTemplate.template.components.header.url != ''">
                                                        <div v-if="sendContent.waTemplate.template.components.header.format == 'DOCUMENT'" class="d-flex p-3 rounded border align-items align-items-center">
                                                            <i class="fa-light fa-file fa-lg mr-2"></i>
                                                            <span>{{sendContent.waTemplate.template.components.header.fileName}}</span>
                                                        </div>
                                                        <div v-else-if="sendContent.waTemplate.template.components.header.format == 'IMAGE'" class="text-center">
                                                            <el-image class="rounded" style="width: 100%; max-height: 220px" :src="sendContent.waTemplate.template.components.header.url" fit="cover"></el-image>
                                                        </div>
                                                        <div v-else class="text-center">
                                                            <video controls preload="metadata" class="rounded" style="width: 100%; max-height: 200px">
                                                                <source :src="sendContent.waTemplate.template.components.header.url+'#t=0.1'">
                                                            </video>
                                                        </div>
                                                    </div>
                                                    <el-upload v-else                                                  
                                                        drag
                                                        class="uploadWidth100 mb-3"
                                                        :accept="sendContent.waTemplate.template.components.header.acceptFile"
                                                        ref="uploadFileWA"
                                                        show-file-list="false"
                                                        :on-change="waFileChanged"
                                                        http-request="sendFile"
                                                        :auto-upload="false">
                                                        <div class="action bg-light-hover w-100">                                                        
                                                            <div class="w-100 rounded p-4 text-center">
                                                                <div class="mb-2">
                                                                    <i class="fa-xl" :class="sendContent.waTemplate.template.components.header.icon "></i>   
                                                                </div>
                                                                <div class="text-primary">{{sendContent.waTemplate.template.components.header.uploadLabel}}</div>                                                                                                                            
                                                            </div>                                                
                                                            
                                                        </div>
                                                    </el-upload>
                                                </div>
                                                <div v-else>
                                                    {{sendContent.waTemplate.template.preview.header}}
                                                </div>

                                            </div>

                                            <div v-if="sendContent.waTemplate.template.preview.body">
                                                {{sendContent.waTemplate.template.preview.body}}
                                            </div>
                                            <div v-if="sendContent.waTemplate.template.json_builder.footer" class="mt-2 text-muted h7">
                                                {{sendContent.waTemplate.template.json_builder.footer.text}}
                                            </div>
                                            <div v-if="sendContent.waTemplate.template.json_builder.buttons" class="mt-2">
                                                <p v-for="btt in sendContent.waTemplate.template.json_builder.buttons.buttons" class="p_add_btt">{{btt.text}}</p>
                                            </div>

                                        </div>

                                        <div v-if="sendContent.waTemplate.template.components.header && sendContent.waTemplate.template.components.header.pers && sendContent.waTemplate.template.components.header.format == 'TEXT'">
                                            <label v-t="'f.msg79'"></label>
                                            <div v-for="item in sendContent.waTemplate.template.components.header.pers" class="d-flex justify-content-between align-items-center div_item mb-3"> 
                                                <input disabled type="text" class="myimput w-20" :value="item.label"/> 
                                                <div class="px-2"> <i class="fal fa-arrow-right"></i></div>
                                                <div class="w-80">
                                                    <my-input v-model="item.value" @input="onSendContenChange('header')"></my-input>
                                                </div>                                                        
                                            </div>
                                        </div>

                                        <div v-if="sendContent.waTemplate.template.components.body">
                                            <label class="mt-3" v-if="sendContent.waTemplate.template.components.header && sendContent.waTemplate.template.components.header.format == 'TEXT'" v-t="'f.msg80'"></label>
                                            <div v-for="item in sendContent.waTemplate.template.components.body.pers" class="d-flex justify-content-between align-items-center div_item mb-3"> 
                                                <input disabled type="text" class="myimput w-20" :value="item.label"/> 
                                                <div class="px-2"> <i class="fal fa-arrow-right"></i></div>
                                                <div class="w-80">
                                                    <my-input v-model="item.value" @input="onSendContenChange('body')"></my-input>
                                                </div>
                                            </div>
                                        </div>

                                        <div class="mt-3 w-100 text-center" v-if="scheduleFlow.active">
                                            <el-date-picker
                                                value-format="timestamp"
                                                time-arrow-control
                                                :format="schedule.dateTimeFormat"
                                                v-model="schedule.time"
                                                type="datetime">
                                            </el-date-picker>
                                        </div>

                                    </div>
                                    
                                </el-tab-pane>
                                <el-tab-pane :label="$t('step')" name="step" v-if="sendContent.type != 'wa_template'">
                                    <div v-if="sendContent.step.tab === 'flows'">
                                        <div class="py-1 mb-2" v-if="pageFlows.length > 5">
                                            <input type="text" v-model="sendContent.flow.search" class="form-control search-box" :placeholder="$t('search')">
                                        </div>
                                        <div v-for="item in pageFlows" class="w-100 d-flex justify-content-between align-items-center px-3 py-3 border-top c_pointer" v-on:click="onSendContenChange('flow', item)" v-if="item.inbox == 1 && (item.channel == -1 || item.channel == 15 && activeChatInfo.phone && cur_page.voice || getItemName(userChannels, item.channel)) && (sendContent.flow.search === '' || item.d.toLowerCase().includes(sendContent.flow.search.toLowerCase()))">
                                            <div style="max-width: calc(100% - 70px)" class="d-flex align-items-center">
                                                <i v-if="item.channel == -1" class="fa-xl fal fa-dice-d20"></i>
                                                <i v-else class="fa-xl" :class="getItemName(channels, item.channel, ['id','icon'])"></i>
                                                <div class="ml-3 text-truncate">
                                                    {{item.d}}
                                                </div>
                                            </div>
                                            <div>
                                                <i class="fa-light fa-chevrons-right fa-lg"></i>
                                            </div>
                                        </div>
                                    </div>
                                    <div v-else-if="sendContent.step.subData === null" class="text-center p-5">
                                        <div class="spinner-grow text-muted"></div>
                                    </div>
                                    <div v-else-if="sendContent.step.tab === 'steps'">
                                        <div class="d-flex align-items-center mb-2">
                                            <div class="d-flex p-2 c_pointer" v-on:click="sendContent.step.tab = 'flows'">
                                                <i class="fa-light fa-arrow-left"></i>
                                            </div>
                                            <div class="py-1 ml-1 w-100" v-if="pageFlows.length > 0">
                                                <input type="text" v-model="sendContent.step.search" class="form-control search-box" :placeholder="$t('search')">
                                            </div>
                                        </div>
                                        
                                        <div v-for="item in sendContent.step.subData" class="w-100 d-flex justify-content-between align-items-center px-3 py-3 border-top" v-if="(item.channel == -1 || item.channel == 15 && activeChatInfo.phone && cur_page.voice || getItemName(userChannels, item.channel)) && (sendContent.step.search === '' || sendContent.step.search == item.id || item.d.toLowerCase().includes(sendContent.step.search.toLowerCase()))">
                                            <div style="max-width: calc(100% - 70px)" class="d-flex align-items-center">
                                                <i v-if="item.channel == -1" class="fa-xl fal fa-dice-d20"></i>
                                                <i v-else class="fa-xl" :class="getItemName(channels, item.channel, ['id','icon'])"></i>
                                                <div class="ml-3 text-truncate">
                                                    {{item.d}}
                                                </div>
                                            </div>
                                            <div class="p-2 c_pointer" v-if="item.channel == -1 && userChannels.length > 1" v-on:click="onSendContenChange('step', item)">
                                                <i class="fa-light fa-chevrons-right fa-lg"></i>
                                            </div>
                                            <div v-else-if="item.channel != 15" class="p-2 c_pointer" v-on:click="sendFlow(item, item.channel)">
                                                <i class="fa-light fa-paper-plane-top fa-lg"></i>
                                            </div>
                                        </div>
                                    </div>
                                    <div v-else>
                                        <div class="d-flex align-items-center p-2 c_pointer mb-2" v-on:click="sendContent.step.tab = 'steps'">
                                            <i class="fa-light fa-arrow-left mr-3"></i> 
                                            <span v-t="'selectChannel'"></span>                                           
                                        </div>

                                        <div v-for="item in userChannels" class="w-100 d-flex justify-content-between align-items-center px-3 py-3 border-top" v-if="item.channel != 15">
                                            <div style="max-width: calc(100% - 70px)" class="d-flex align-items-center">
                                                <i v-if="item.channel == -1" class="fa-xl fal fa-dice-d20"></i>
                                                <i v-else class="fa-xl" :class="item.icon"></i>
                                                <div class="ml-3 text-truncate">
                                                    {{item.name}}
                                                </div>
                                            </div>
                                            <div class="p-2 c_pointer" v-on:click="sendFlow(sendContent.step.step, item.id)">
                                                <i class="fa-light fa-paper-plane-top fa-lg"></i>
                                            </div>
                                        </div>                                           
                                    </div>                                 
                                    
                                    

                                </el-tab-pane>
                            </el-tabs>
                        </template>
                        

                    </div>
                    <div class="modal-footer">
                        <div class="d-flex px-3 py-2 justify-content-between w-100"> 
                            <button v-t="'cancel'" data-dismiss="modal" type="button" class="btn btn-outline-secondary nagative"></button>
                            <div class="d-flex">
                                <el-tooltip v-if="!scheduleFlow.active" class="item" effect="dark" :content="$t('i.sendLater')" placement="top">
                                    <button v-if="sendContent && sendContent.type == 'wa_template'" type="button" class="btn btn-outline-secondary px-3 mr-3" @click="preScheduleFlow">
                                        <i class="fa-light fa-clock"></i> 
                                    </button>
                                </el-tooltip>  
                                <div v-if="sendContent && sendContent.type == 'wa_template'">
                                    <button v-if="!scheduleFlow.active" :disabled="!sendContent.isReady" v-t="'send'" data-dismiss="modal" type="button" class="btn btn-primary positive" @click="sendFlow(null, null)"></button>
                                    <button v-else :disabled="!sendContent.isReady" v-t="'i.sendLater'" data-dismiss="modal" type="button" class="btn btn-primary positive" @click="sendFlow(null, null)"></button>
                                </div>                               
                                
                            </div>                            
                        </div>
                    </div>
                </div>
            </div>        
        </div>

        <div id="customFieldsModal" class="modal fade">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <div class="invisible"></div>
                        <h5 class="modal-title">{{ $t('c_fields', 2) }}</h5>       
                        <div class="modal-dismiss" data-dismiss="modal" aria-label="Close">
                            <i class="fal fa-times"></i>  
                        </div>
                    </div>
                    <div class="modal-body">
                        
                        <div v-for="t in customFields">
                            <label>{{ t.name }}</label>
                            <input type="text" class="form-control">
                        </div>

                    </div>
                    <div class="modal-footer">
                        <div class="d-flex px-3 py-2 justify-content-between w-100"> 
                            <button v-t="'cancel'" data-dismiss="modal" type="button" class="btn btn-outline-secondary nagative"></button>
                            <button v-t="'confirm'" data-dismiss="modal" type="button" class="btn btn-primary positive" @click="deleteUser"></button>
                        </div>
                    </div>
                </div>
            </div>        
        </div>


        <div id="fileManagerModel" class="modal fade" data-backdrop="static">
            <div class="modal-dialog modal-lg modal-dialog-scrollable">
                <div class="modal-content">
                    <div class="modal-header">
                        <div class="invisible"></div>
                        <h5 class="modal-title" v-t="'i.mediaLibrary'"></h5>       
                        <div class="modal-dismiss" data-dismiss="modal" aria-label="Close">
                            <i class="fal fa-times"></i>  
                        </div>
                    </div>
                    <div class="modal-body pt-2">
                                <div v-if="mediaLibray.view == 'list'">
                                    <div v-if="mediaLibray.items === null" class="py-5 text-center">
                                        <div class="spinner-grow text-secondary" role="status">
                                            <span v-t="'processing'" class="sr-only"></span>
                                        </div>
                                    </div>
                                    <div v-else>                                    
                                        <div v-if="mediaLibray.items.length > 0" class="d-flex justify-content-between align-items-center pt-0 pb-2 px-2 border-bottom">
                                            <div class="d-flex align-items-center">
                                                <el-input :placeholder="$t('search')" v-model="mediaLibray.search" size="small"></el-input>
                                            </div>
                                            <el-upload
                                                :accept="selectedSendChannel.acceptFile"
                                                ref="uploadFile"
                                                show-file-list="false"
                                                :file-list="mediaLibray.upload.fileList"
                                                :on-change="fileChangedML"
                                                http-request="sendFile"
                                                :auto-upload="false">
                                                <div slot="file"></div>
                                                <div slot="trigger" class="action bg-light-hover">                                                
                                                    <el-button type="text" v-t="'upload'" class="px-3"></el-button>                                                   
                                                </div>
                                            </el-upload>  
                                        </div>
                                        <div v-if="mediaLibray.items.length == 0" class="w-100 py-5 px-2">
                                            <div class="mx-auto text-center">
                                                <h4 v-t="'i.msg21'"></h4>
                                                <p class="text-secondary mb-2" v-t="'i.msg20'"></p>
                                                <el-upload
                                                    :accept="selectedSendChannel.acceptFile"
                                                    ref="uploadFile"
                                                    show-file-list="false"
                                                    :file-list="mediaLibray.upload.fileList"
                                                    :on-change="fileChangedML"
                                                    http-request="sendFile"
                                                    :auto-upload="false">
                                                    <div slot="file"></div>
                                                    <div slot="trigger" class="action bg-light-hover">                                                
                                                        <el-button type="text" v-t="'upload'"></el-button>                                                   
                                                    </div>
                                                </el-upload> 
                                            </div>
                                        </div>
                                        <div v-else>
                                            <div v-if="mediaLibray.view == 'list'" class="p-2">
                                                <div v-for="(file, index) in mediaLibray.items" class="mb-2 z-depth-1 d-flex align-items-center p-2 div_item" v-if="(mediaLibray.search === '' || file.name.toLowerCase().includes(mediaLibray.search))">                                            
                                                    <div>
                                                        <div v-if="file.type == 'image'">
                                                            <el-image fit="cover"  :src="file.url" :preview-src-list="[file.url]" style="width: 70px; height: 70px;" class="rounded"></el-image>
                                                        </div>
                                                        <div v-else-if="file.type == 'video'">
                                                            <video controls preload="metadata" style="width: 180px; height: 100px;">
                                                                <source v-bind:src="file.url+'#t=0.1'">
                                                            </video>
                                                        </div>
                                                        <div v-else-if="file.type == 'file'" class="pl-3">
                                                            <i class="fa-light fa-file fa-xl text-secondary"></i>                                                                
                                                        </div>
                                                    </div>
                                                    <div class="pl-3">
                                                        <p class="mb-1">{{file.name}}</p>
                                                        <div class="d-flex align-items-center w-100 justify-content-between">
                                                            <p class="small text-secondary my-0">{{file.strSize}}</p>
                                                            <el-button type="text" v-t="'rename'" class="ml-4 text-secondary my-0 py-1 actions" @click="renameMedia(file)"></el-button>
                                                            <el-button type="text" v-t="'delete'" class="ml-3 text-secondary my-0 py-1 actions" @click="deleteMedia(file, index)"></el-button>
                                                        </div>
                                                        
                                                    </div>
                                                    <div class="ml-auto pr-2">
                                                        <el-checkbox v-model="file.selected" @change="updateSelectedMedia"></el-checkbox>
                                                    </div>
                                                </div>
                                            </div>                                            
                                        </div>                                    
                                    </div>
                                </div>
                                <div v-else>
                                    <div class="p-5 w-100 text-center">
                                        <div class="spinner-grow text-secondary" role="status">
                                            <span v-t="'processing'" class="sr-only"></span>
                                        </div>
                                    </div>
                                </div>
                    </div>
                    <div class="modal-footer">
                        <div class="d-flex px-3 py-2 justify-content-between w-100"> 
                            <button v-t="'cancel'" data-dismiss="modal" type="button" class="btn btn-outline-secondary nagative"></button>
                            <button v-t="'send'" data-dismiss="modal" type="button" class="btn btn-primary positive" @click="sendMedia" :disabled="mediaLibray.selectedItems.length == 0"></button>
                        </div>
                    </div>
                    
                </div>
            </div>        
        </div>

        <div id="createAppointment" class="modal fade">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <div class="invisible"></div>
                        <h5 class="modal-title" v-t="'cal.createEvent'"></h5>       
                        <div class="modal-dismiss" data-dismiss="modal" aria-label="Close">
                            <i class="fal fa-times"></i>  
                        </div>
                    </div>
                    <div class="modal-body pb-5" v-if="calendars">                        
                        <div class="form-group">
                            <label v-t="'cal.calendars'"></label>
                            <el-select class="w-100"  v-model="newAppointment.calendarID" filterable v-on:change="createAppointment('setLink')">
                                <el-option v-for="item in calendars" :key="item.id" :label="item.name" :value="item.id"></el-option>
                            </el-select>
                        </div>
                        <div v-if="newAppointment.calendarID" class="mt-4">
                            <button type="button" class="btn btn-light text-dark rounded w-100 mb-3"  v-on:click="createAppointment('sendLink')" v-t="'cal.sendLink'"></button>
                            <button type="button" class="btn btn-light text-dark rounded w-100"  v-on:click="createAppointment('goToLink')" v-t="'cal.goLink'"></button>
                        </div>

                    </div>
                    
                </div>
            </div>        
        </div>

        <el-dialog :visible.sync="dialogPreviewFile.visible">
            <div class="w-100 text-center">
                <img v-if="dialogPreviewFile.type == 'image'" class="mx75vh" height="auto" width="auto" :src="dialogPreviewFile.url"  alt="">
                <el-image 
                    style="width: 100px; height: 100px"
                    :src="dialogPreviewFile.url" 
                    :preview-src-list="[dialogPreviewFile.url]">
                </el-image>
            </div>
        </el-dialog>

        
        <div id="deleteUserModal" class="modal fade">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <div class="invisible"></div>
                        <h5 v-t="'delete_contact'" class="modal-title"></h5>       
                        <div class="modal-dismiss" data-dismiss="modal" aria-label="Close">
                            <i class="fal fa-times"></i>  
                        </div>
                    </div>
                    <div class="modal-body">
                        
                        <p>{{$tc('msg2', 1)}} {{$t('msg3')}}</p>

                    </div>
                    <div class="modal-footer">
                           <div class="d-flex px-3 py-2 justify-content-between w-100"> 
                            <button v-t="'cancel'" data-dismiss="modal" type="button" class="btn btn-outline-secondary nagative"></button>
                            <button v-t="'confirm'" data-dismiss="modal" type="button" class="btn btn-primary positive" @click="deleteUser"></button>
                        </div>
                    </div>
                </div>
            </div>        
        </div>

        <?php include("partial/boards/edit-card.php") ?>
        <?php include("partial/boards/add-card.php") ?>
    </div>

    <div id="conditionModal" class="modal fade">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <div class="invisible"></div>
                    <h5 data-v-t="'moreOption'" class="modal-title"></h5>       
                    <div class="modal-dismiss invisible" data-dismiss="modal" aria-label="Close">
                        <i class="fal fa-times"></i>  
                    </div>
                </div>
                <div class="modal-body">
                    <div class="row my-5" id="div_cdtions"></div>
                </div>

                <div class="modal-footer">
                    <div class="d-flex px-3 py-2 justify-content-between w-100"> 
                        <button data-v-t="'continue'" data-dismiss="modal" type="button" class="btn btn-primary w-100"></button>
                    </div>
                </div>
            </div>
        </div>   
           
    </div>

    <div id="builder_components"><?php include("builder-components.php") ?></div>
    <script>isBuilder=0</script>
    
    <?php $langFile = ['inbox.js', 'flows.js', 'rules.js', 'users.js', 'ecommerce.js', 'calendars.js', 'boards.js']; ?>
       
    <?php include("partial/load_js.php") ?>
    <script src="../js/libs/moment-timezone.min.js"></script>
    <script src="../js/flow-builder-core.js?v=251"></script>
    <script src="../js/board-utilities.js?v=5"></script>
    <script src="../js/inbox.js?v=164"></script>
    <script src="../js/libs/load-image.all.min.js"></script>
    <?php include("partial/footer.php") ?>

</body>

</html>