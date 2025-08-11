<div v-for="(m, index) in activeChatMessages" >
    
<div v-if="m">
    <div v-if="m.data.dateVisible" class="h7 bold text-center my-3">
        {{m.data.dateVisible}}
    </div>

    
    
    <div v-if="m.data.action" class="mt-0 mb-3 divSeem" v-bind:title="m.info ? m.info.full : ''"> 
        <div v-if="m.data.action.type == 'recording'">
            <p class="text-center text-secondary my-0 h7" v-t="i.msg17"></p>
        </div> 
        <div v-else>
            <div v-if="m.data.action.type === 0">
                <div v-if="!m.ignore" class="d-flex justify-content-end w-100 my-1">
                    <el-avatar :size="18" :src="activeChatInfo.profile_pic">
                        <img src="../images/view_photo.png"/>
                    </el-avatar>
                </div>            
            </div>
            <p v-else class="text-center text-secondary my-0 h7">
                {{ m.data.action.text }}                                  
            </p>
            <p v-if="m.data.action.subTitle" class="text-center text-secondary my-0 h7">
                <b>{{m.data.action.subTitle}}</b>                                  
            </p>
            <p v-if="m.data.action.url" class="text-center my-0 h7"> 
                <a v-if="m.data.action.urlLabel" v-bind:href="m.data.action.url" target="_blank">{{m.data.action.urlLabel}}</a>
                <a v-else v-t="'learnMore'" v-bind:href="m.data.action.url" target="_blank"></a>
            </p>
        </div>     
        
    </div>
    <div v-else-if="m.data.message">
        <div class="clearfix" v-for="m2 in m.data.message" v-if="m2 && m2.info" @dblclick="m2.info.visible = !m2.info.visible" v-bind:class="[ (!webchat && m2.dir == 0) || (webchat && m2.dir == 1) ? 'my-message  animate__animated animate__slideInRight' : 'other-message  animate__animated animate__slideInLeft']">
        <div class="clearfix">
            
        

        <div v-if="m2.info.visible" class="text-center">
            <p class="my-0 h7 text-muted">{{m2.info.sentTime}}</p>
            <p v-if="m2.info.sentBy" class="my-0 text-muted h7">{{m2.info.sentBy}}</p>            
        </div>

        <div v-if="m.data.dir == 3" class="text-center my-3">
            <div v-if="m2.type == 'recording'">
                <p class="text-secondary mb-1 h7" v-t="'i.msg17'"></p>
                <audio controls>
                    <source v-bind:src="m2.url">
                </audio> 
            </div>
            <div v-if="m2.type == 'call.transcribed'">
                <p class="text-secondary mb-1 h7" v-t="'i.msg18'"></p>
                <div class="message-text mx-auto">
                    <pre class="m-0 text-left">{{m2.text}}</pre>
                </div>
                
            </div>
        </div>
        <div class="chat-avatar float-left mr-2 mt-2" v-else-if="webchat && m2.dir == 0 && myjs.getQuery('showPersona') == 'true'">
            <img v-bind:src="pageData.persona">
        </div>

       
        <div v-if="m.data.dir != 3" class="message my-2" :class="m2.repliedMsg ? 'repliedMsg' : ''" v-bind:title='m2.info.full'>
            <div v-if="m2.product" class="mb-2">
                <div class="div_c2">
                    <div class="pt-0">
                        <div class="img-box r_horizontal" v-if="m2.product.img">
                            <img v-bind:src="m2.product.img" alt="">
                        </div>
                        <div class="py-1 px-2 bg-white">
                            <p class="m-0">
                                <b>{{ m2.product.n }}</b>
                            </p>
                            <div v-if="m2.product.t == 1">
                                <p v-if="m2.product.o3 !== ''" class="m-0">{{m2.product.o0}} • {{m2.product.o1}} • {{m2.product.o2}} • {{m2.product.o3}}</p>
                                <p v-else-if="m2.product.o2 !== ''" class="m-0">{{m2.product.o0}} • {{m2.product.o1}} • {{m2.product.o2}}</p>
                                <p v-else-if="m2.product.o1 !== ''" class="m-0">{{m2.product.o0}} • {{m2.product.o1}}</p>
                                <p v-else class="m-0">{{m2.product.o0}}</p>                                
                            </div>                                
                            <p class="m-0">{{formatMoney(m2.product.p, ecommerceSettings.currency) }}</p>
                        </div>
                    </div>
                    <div class="div_btts" v-if="0">
                        <p class="p_add_btt" data-index="0" data-pindex="0" v-for="b in e.buttons" v-on:click="clickButton(b)">
                            {{ b.title }}
                        </p>
                    </div>
                </div>
            </div>
            
            <div v-if="m2.wa == 1">
                <div v-if="m2.type == 'text'" class="message-text">
                    <pre v-if="1 || m2.text.body.includes('html')" class="m-0">{{m2.text.body}}</pre>
                    <pre v-else class="m-0" v-html="renderTextMessage(m2.text.body)"></pre>
                </div>

                <div v-else-if="m2.type == 'interactive' && m2.interactive.type === 'product'" class="message-attach message-attach-big">
                     
                </div>
                <div v-else-if="m2.type == 'interactive' && m2.interactive.type === 'product_list'" class="message-attach message-attach-big">
                    
                </div>
                <div v-else-if="m2.type == 'interactive'" class="message-attach message-attach-big">
                    <div class="flow flow-text">
                        <div class="div_flow_content">
                            <div class="my-0 pb-0 textarea_c div_text_c">
                                <pre class="m-0 text-left">{{ m2.interactive.body.text}}</pre>
                            </div>
                            <div class="div_btts">
                                <p v-if="m2.interactive.type == 'button'" class="p_add_btt" data-index="0" data-pindex="0" v-for="b in m2.interactive.action.buttons" v-on:click="clickButton(b)">
                                    {{ b.reply.title }}
                                </p>
                                <p v-if="m2.interactive.type == 'list'" class="p_add_btt" data-index="0" data-pindex="0">
                                    {{ m2.interactive.action.button }}
                                </p>
                                <p v-if="m2.interactive.type == 'cta_url'" class="p_add_btt" data-index="0" data-pindex="0">
                                    {{ m2.interactive.action.parameters.display_text }}
                                </p>

                            </div>
                        </div>
                    </div>
                </div>

                <div v-else-if="m2.type == 'document'" class="message-text">
                    <div class="d-flex align-items-center">
                        <i class="fal fa-file mr-3"></i>
                        <a v-bind:href="m2.document.link" target="_BLANK">{{m2.document.filename}}</a>
                    </div>
                </div>
                <div v-else-if="m2.type == 'image' || m2.type == 'video' || m2.type == 'audio' || m2.type == 'voice'" class="message-attach message-attach-big" :class="m2.dir == 0 ? 'text-right': ''">
                    <el-image 
                        v-if="m2.type == 'image'"
                        class="message-attach-midia rounded"
                        :src="m2.image.link" 
                        :preview-src-list="[m2.image.link]">
                    </el-image>
                    
                    
                    <video v-else-if="m2.type == 'video'" controls preload="metadata" class="message-attach-midia">
                        <source  v-bind:src="m2.video.link+'#t=0.1'">
                    </video>

                    <audio controls v-else-if="m2.type == 'audio' || m2.type == 'voice'">
                        <source v-bind:src="m2.audio.link">
                    </audio>                    
                    
                </div>
                <div v-else-if="m2.type == 'template'">
                    <p class="text-center text-secondary my-0 pb-2">
                        {{ m2.template.name}} 
                    </p>


                   <div v-if="m2.data">
                        <div v-if="m2.data.header" class="message-attach message-attach-big" :class="m2.dir == 0 ? 'text-right': ''">
                            <el-image 
                                v-if="m2.data.header.format == 'IMAGE'"
                                class="message-attach-midia rounded"
                                :src="m2.data.header.url" 
                                :preview-src-list="[m2.data.header.url]">
                            </el-image>
                            
                            <video controls preload="metadata" v-else-if="m2.data.header.format == 'VIDEO'">
                                <source v-bind:src="m2.data.header.url+'#t=0.1'">
                            </video>
                            <div v-else-if="m2.data.header.format == 'DOCUMENT'" class="message-text mb-2">
                                <div class="d-flex align-items-center">
                                    <i class="fal fa-file mr-3 hide"></i>
                                    <a v-bind:href="m2.data.header.url" target="_BLANK" v-t="'download'"></a>
                                </div>
                            </div>
                        </div>

                        <div v-if="m2.data.buttons !== null" class="flow flow-text">
                            <div class="div_flow_content">
                                <div class="my-0 pb-0 textarea_c div_text_c">
                                    <pre class="m-0 text-left" v-html="renderTextMessage(m2.data.body.text)"></pre>
                                </div>
                                <div class="div_btts">
                                    <p class="p_add_btt" data-index="0" data-pindex="0" v-for="b in m2.data.buttons.buttons" v-on:click="clickButton(b)">
                                        {{ b.text }}
                                    </p>
                                </div>
                                
                            </div>
                        </div>
                        <div v-else class="message-text" :class="m2.failed ? 'bg-danger' : ''">                            
                            <pre v-if="1 || m2.data.body.text.includes('html')" class="m-0">{{m2.data.body.text}}</pre>
                            <pre v-else class="m-0" v-html="renderTextMessage(m2.data.body.text)"></pre>
                        </div>
                   </div>
                   
                    
                </div>
                <div v-else-if="m2.type == 'location'" class="message-text">
                    <a target="_blank" :href="'https://www.google.com/maps/search/?api=1&query='+m2.location.latitude+'%2C'+m2.location.longitude">https://www.google.com/maps/search/?api=1&query={{m2.location.latitude}}%2C{{m2.location.longitude}}</a>
                </div>
            </div> 
            
            

            <div v-else-if="m2.text === undefined && (m2.g == 1 || m2.messageId)">
                <div class="message-attach message-attach-big" :class="m2.dir == 0 ? 'text-right': ''">
                    <el-image 
                        v-if="m2.image"
                        class="message-attach-midia rounded"
                        :src="m2.image.contentInfo.fileUrl" 
                        :preview-src-list="[m2.image.contentInfo.fileUrl]">
                    </el-image>

                    <div v-else-if="m2.richCard && m2.richCard.carouselCard">
                        <div :id="'carousel'+index" class="carousel slide" data-bs-ride="carousel" data-interval="false">
                            <div class="carousel-inner">
                                <div v-for="(e, idx) in m2.richCard.carouselCard.cardContents" :key="e" class="carousel-item" v-bind:class = "idx == 0 ?'active':''">
                                    <div class="div_c2 ">
                                        <div class="pt-0">
                                            <div class="img-box " v-bind:class = "'r_'+(m2.richCard.carouselCard.cardWidth == 'MEDIUM' ? 'horizontal' : 'square')" v-if="e.media">
                                                <img v-bind:src="e.media.contentInfo.fileUrl" alt="">
                                            </div>
                                            <div class="py-1 px-2 bg-white">
                                                <p class="m-0" v-if="e.title">
                                                    <b>{{ e.title }}</b>
                                                </p>
                                                <p class="m-0" v-if="e.description">{{ e.description }}</p>
                                            </div>
                                        </div>

                                        <div class="div_btts" v-if="e.suggestions">
                                            <p class="p_add_btt" data-index="0" data-pindex="0" v-for="b in e.suggestions" v-on:click="clickButton(b)">
                                                {{b.action ? b.action.text :  b.reply.text}}
                                            </p>
                                        </div>
                                    </div>
                                </div>                            
                            </div>
                            <a v-f="m2.richCard.carouselCard.cardContents.length > 1" class="carousel-control-prev" :href="'#carousel'+index" role="button" data-slide="prev">
                                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                                <span class="sr-only">Previous</span>
                            </a>
                            <a v-f="m2.richCard.carouselCard.cardContents.length > 1" class="carousel-control-next" :href="'#carousel'+index" role="button" data-slide="next">
                                <span class="carousel-control-next-icon" aria-hidden="true"></span>
                                <span class="sr-only">Next</span>
                            </a>
                        </div>

                    </div>
                    <div v-else-if="m2.richCard && m2.richCard.standaloneCard">
                            
                            <div class="flow flow-text" v-if="!m2.richCard.standaloneCard.cardContent.title">
                                <div class="div_flow_content">
                                    <div class="my-0 pb-0 textarea_c div_text_c">
                                        <pre class="m-0 text-left">{{ m2.richCard.standaloneCard.cardContent.description }}</pre>
                                    </div>
                                    
                                    <div class="div_btts" v-if="m2.richCard.standaloneCard.cardContent.suggestions">
                                        <p class="p_add_btt" data-index="0" data-pindex="0" v-for="b in m2.richCard.standaloneCard.cardContent.suggestions" v-on:click="clickButton(b)">
                                            {{b.action ? b.action.text :  b.reply.text}}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div v-else class="div_c2 " v-for="e in [m2.richCard.standaloneCard.cardContent]">
                                <div class="pt-0">
                                    <div class="img-box r_horizontal" v-if="e.media">
                                        <img v-bind:src="e.media.contentInfo.fileUrl" alt="">
                                    </div>
                                    <div class="py-1 px-2 bg-white">
                                        <p class="m-0" v-if="e.title">
                                            <b>{{ e.title }}</b>
                                        </p>
                                        <p class="m-0" v-if="e.description">{{ e.description }}</p>
                                    </div>
                                </div>

                                <div class="div_btts" v-if="e.suggestions">
                                    <p class="p_add_btt" data-index="0" data-pindex="0" v-for="b in e.suggestions" v-on:click="clickButton(b)">
                                        {{b.action ? b.action.text :  b.reply.text}}
                                    </p>
                                </div>
                            </div>

                    </div>
                </div>
                
            </div>
            <div v-else-if="m2.text">                
                <div class="message-text">
                    <pre v-if="1 || m2.text.includes('html')" class="m-0">{{m2.text}}</pre>
                    <pre v-else class="m-0" v-html="renderTextMessage(m2.text)"></pre>
                </div>                
            </div>

           
            <div v-else-if="m2.attachment" class="message-attach message-attach-big" :class="m2.dir == 0 ? 'text-right': ''">
                <div class="flow flow-text" v-if="m2.attachment.type == 'template' && m2.attachment.payload && m2.attachment.payload.template_type == 'button'">
                    <div class="div_flow_content">
                        <div class="my-0 pb-0 textarea_c div_text_c">
                            <pre class="m-0 text-left" v-html="renderTextMessage(m2.attachment.payload.text)"></pre>
                        </div>
                        <div class="div_btts">
                            <p class="p_add_btt" data-index="0" data-pindex="0" v-for="b in m2.attachment.payload.buttons" v-on:click="clickButton(b)">
                                {{ b.title }}
                            </p>
                        </div>
                    </div>
                </div>
                
                
                <el-image 
                    v-if="m2.attachment.type == 'image' || m2.attachment.type == 'image-gif'"
                    class="message-attach-midia rounded"
                    :src="m2.attachment.payload.url" 
                    :preview-src-list="[m2.attachment.payload.url]">
                </el-image>


                <video v-else-if="m2.attachment.type == 'video'" controls preload="metadata" class="message-attach-midia">
                    <source v-if="m2.attachment.payload.url" v-bind:src="m2.attachment.payload.url+'#t=0.1'">
                    <source v-else v-bind:src="appDomain+'r?p='+pageId+'&att='+m2.attachment.payload.attachment_id+'&u='+(user ? user.id+'&h='+user.hash :  activeChatInfo.ms_id+'&h='+activeChatInfo.hash)">
                </video>
                <p v-if="m2.story" class="m-0 text-secondary text-center" v-t="'i.msg14'"></p>
                <p v-else-if="m2.storyM" class="m-0 text-secondary text-center" v-t="'i.msg15'"></p>



                <audio controls v-else-if="m2.attachment.type == 'audio'">
                    <source v-if="m2.attachment.payload.url" v-bind:src="m2.attachment.payload.url">
                    <source v-else v-bind:src="appDomain+'r?p='+pageId+'&att='+m2.attachment.payload.attachment_id+'&u='+(user ? user.id+'&h='+user.hash :  activeChatInfo.ms_id+'&h='+activeChatInfo.hash)">
                </audio>

                <div v-else-if="m2.attachment.type == 'ig_reel'">
                    <video  controls preload="metadata" class="message-attach-midia">
                        <source v-if="m2.attachment.payload.url" v-bind:src="m2.attachment.payload.url+'#t=0.1'">
                        <source v-else v-bind:src="appDomain+'r?p='+pageId+'&att='+m2.attachment.payload.attachment_id+'&u='+(user ? user.id+'&h='+user.hash :  activeChatInfo.ms_id+'&h='+activeChatInfo.hash)">
                    </video>
                    <p class="m-0 text-secondary text-center">Reel</p>
                </div>
                
                
                <div v-else-if="m2.attachment.type == 'file'" class="message-text">                    
                    <a  v-if="m2.attachment.payload.url" v-bind:href="m2.attachment.payload.url" target="_BLANK">
                        <i class="fa-light fa-file"></i>
                        <span v-if="m2.attachment.payload.fileName">{{m2.attachment.payload.fileName}}</span>
                        <span v-else v-t="'download'"></span>
                    </a>
                    <a v-t="'download'" v-else v-bind:href="appDomain+'r?p='+pageId+'&att='+m2.attachment.payload.attachment_id+'&u='+(user ? user.id+'&h='+user.hash :  activeChatInfo.ms_id+'&h='+activeChatInfo.hash)" target="_BLANK"></a>
                </div>

                <div v-if="m2.attachment.type == 'template' && m2.attachment.payload && m2.attachment.payload.template_type == 'generic'">
                    <div v-if="m2.attachment.payload.elements" :id="'carousel'+index" class="carousel slide" data-bs-ride="carousel" data-interval="false">
                        <div class="carousel-inner">
                            <div v-for="(e, idx) in m2.attachment.payload.elements" :key="e" class="carousel-item" v-bind:class = "idx == 0 ?'active':''">
                                <div class="div_c2 ">
                                    <div class="pt-0">
                                        <div class="img-box " v-bind:class = "'r_'+m2.attachment.payload.image_aspect_ratio" v-if="e.image_url">
                                            <img v-bind:src="e.image_url" alt="">
                                        </div>
                                        <div class="py-1 px-2 bg-white">
                                            <p class="m-0">
                                                <b>{{ e.title }}</b>
                                            </p>
                                            <pre class="m-0">{{ e.subtitle }}</pre>
                                            <p v-if="e.subtitle1" class="m-0">{{e.subtitle1}}</p>
                                        </div>
                                    </div>

                                    <div class="div_btts" v-if="e.buttons">
                                        <p class="p_add_btt" data-index="0" data-pindex="0" v-for="b in e.buttons" v-on:click="clickButton(b)">
                                            {{ b.title }}
                                        </p>
                                    </div>
                                </div>

                            </div>                            
                        </div>
                        <a v-if="m2.attachment.payload.elements.length > 1" class="carousel-control-prev" :href="'#carousel'+index" role="button" data-slide="prev">
                            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                            <span class="sr-only">Previous</span>
                        </a>
                        <a v-if="m2.attachment.payload.elements.length > 1" class="carousel-control-next" :href="'#carousel'+index" role="button" data-slide="next">
                            <span class="carousel-control-next-icon" aria-hidden="true"></span>
                            <span class="sr-only">Next</span>
                        </a>
                    </div>

                </div>

               
                <div v-if="m2.attachment.type == 'template' && m2.attachment.payload && m2.attachment.payload.template_type == 'media'">
                    
                    <div v-for="e in m2.attachment.payload.elements">
                    <div class="div_c2 ">
                        <div class="pt-0">
                            <div class="img-box" v-if="e.media_type == 'image'">
                                <img v-if="e.url" v-bind:src="e.url" alt="">
                                <img v-else v-bind:src="appDomain+'r?p='+pageId+'&att='+e.attachment_id+'&u='+(user ? user.id+'&h='+user.hash :  activeChatInfo.ms_id+'&h='+activeChatInfo.hash)" alt="">
                            </div>
                            <div v-if="e.media_type == 'video'">
                                <video controls preload="metadata">
                                    <source v-if="e.url" v-bind:src="e.url+'#t=0.1'">
                                    <source v-else v-bind:src="appDomain+'r?p='+pageId+'&att='+e.attachment_id+'&u='+(user ? user.id+'&h='+user.hash :  activeChatInfo.ms_id+'&h='+activeChatInfo.hash)">
                                </video>
                            </div>
                        </div>

                        <div class="div_btts">
                            <p class="p_add_btt" data-index="0" data-pindex="0" v-for="b in e.buttons" v-on:click="clickButton(b)">
                                {{ b.title }}
                            </p>
                        </div>
                    </div>

                </div>
                </div>

            </div>

            <i v-if="!webchat" class="channelIcon" v-bind:class="[getChannelById(m2.channel).icon]" v-bind:style="{ color: getChannelById(m2.channel).color}"></i>
            
            <div v-if="m2.failed" :title="m2.failed.reason" class="text-right w-100">
                <p class="my-0 h7 text-danger" v-t="'i.msg19'"></p>
            </div>
        </div>

        </div>

        <div v-if="webchat && m2.quick_replies && (index == activeChatMessages.length - 1 || (index == activeChatMessages.length - 2) && activeChatMessages[activeChatMessages.length - 1].data.message[0].type == 'typing')" class="mt-3 clearfix text-center">
            <button type="button" class="btn btn-outline-primary pill m-1 quick-reply" v-for="q in m2.quick_replies" v-if="q.content_type=='text'" v-on:click="clickReply(q)">{{q.title}}</button>
        </div>

        <!--<div v-if="m2.type == 'typing' && index == activeChatMessages.length - 1">
            <div class="animate__animated animate__slideInLeft">
                <img src="https://kirszenberg.com/4036e7066ee11fb6c17c74933b190b7d/typing-indicator.gif" height="32px">
            </div>
        </div>-->

            <div class="pb-4" :class="m2.dir == 1 ? 'text-left' : 'text-right'" v-if="m2.channel == 5 && m2.info.visible && (m.data.id || m2.id)"><button type="button" class="btn btn-link h7" @click="setRelyingTo(m.data.id,m2)" v-t="'i.reply'"></button></div>
        </div>
        
    </div>              

</div>
</div>

<div class="message-delay">
    <div class="animate__animated animate__slideInLeft">
        <img src="../assets/typing.gif" height="48px">
    </div>
</div>