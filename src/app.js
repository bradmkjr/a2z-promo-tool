var fs = require('fs');
var express = require('express');
var app = express();

var Jimp = require("jimp");
var Bitly = require('bitly');
var Twit = require('twit');
// var sqlite3 = require('sqlite3').verbose();
// var db = new sqlite3.Database('./src/data/database.db');

var cache = require('sqlcachedb');

var htmlparser = require("htmlparser");

var cheerio = require('cheerio');
var request = require('request');

var title = '';
var category = '';
var coupon = '';
var description = '';
var amazonImg = '';
var amazonURL = '';
var shortURL = ''; 
var longURL = '';

var b64content = '';

var response = '';

var tags = ['#Amazon', '#PROMO', '#Savings', '#Discount', '#SALE', '#Bargin', '#Promotion', '#Coupon', '#DEALS'];

var rawHtml = '<div id="" class="container bg-no-repeat associates" style="width:100%;"><div class="text align-left ">Here are some promotions that manufacturers want to share with associates. Remember to open links below and confirm the promotion is active before sharing it with customers. If associates refer customers to the page before a promotion has started or after it has ended, customers will be redirected to Amazon’s Deals page. We regularly review performance and may reach out with exclusive promo codes for associates who have successfully shared these promotions.<br><br><u><em>Apparel &amp; Accessories:</em></u><em> <br></em><a href="https://www.amazon.com/gp/mpc/A2KHO21YVYE52J">20ACMEMADE1</a> - 20%   off Acme Made backpack. Available now through 10/22, while supplies last.    <em><br></em><a href="https://www.amazon.com/gp/mpc/A12OWWYGD8CEU4">15TOMMYRFID</a> - 15%   off Tommy Hilfiger men\'s leather wallet. Available now through 11/9, while   supplies last.    <br><a href="https://www.amazon.com/gp/mpc/A2HB81B35QFXPN">15EXACTFIT</a> - 15%   off Exact Fit men\'s belt. Available now through 11/9, while supplies last.    <br><u><em>Arts &amp; Crafts </em></u><a href="https://www.amazon.com/gp/mpc/A1OV4KYUCU91RG">15HALLOWEEN</a> - 15% off Smart-Fab craft fabric for Halloween. Available now through 10/30, while supplies last.    <br><u><em>Beauty:</em></u>  <br><a href="https://www.amazon.com/gp/mpc/A1Z9VT7LQ0CFMS">25ELSIG</a> - 25% off   English Laundry perfume. Available now through 10/31, while supplies last.    <br><a href="https://www.amazon.com/gp/mpc/AGW5UX4R2MQY4">15MYEBFAVS</a> - 15% off Ecco Bella organic beauty products. Available now through 10/23, while supplies last.<u><em><br></em></u><a href="https://www.amazon.com/gp/mpc/AWIQNMCDT6ND6">15THEWINNERS</a> - 15% off La Roche-Posay beauty products. Available now through 10/31, while supplies last.<u><em><br>Camera</em></u> <a href="https://www.amazon.com/gp/mpc/A140DOPLEKLUCR">15EZVIZTROOP</a> - 15% off EZVIZ security system. Available now through 10/20, while supplies last.<br><u><em>Electronics</em></u> <a href="https://www.amazon.com/gp/mpc/AVIGKWGFNUIPJ">15VAUXVERGE</a> - 15% off VAUX smart speaker and battery. Available now through 10/31, while supplies last.<u><em><br>Furniture <br></em></u><a href="https://www.amazon.com/gp/mpc/A2ZE5R0ANBP5LQ">15RUGS</a> - 15% off Mohawk rugs. Available now through 10/31, while supplies last. <u><em><br></em></u><a href="https://www.amazon.com/gp/mpc/A1FUQCPGU8W2DB">102SIMPDRAPB</a> - $102 off Simpli Home mid century storage bench. Available now through 10/26, while supplies last.<br><a href="https://www.amazon.com/gp/mpc/A24TWDLB7S8590">104SIMPAVECT</a> - $104 off Simpli Home coffee table, java. Available now through 10/29, while supplies last.<br><a href="https://www.amazon.com/gp/mpc/A43K0O6A2I0GA">105SIMPDYLHC</a> - $105 off Simpli Home hallway table, driftwood. Available now through 10/26, while supplies last.<br><a href="https://www.amazon.com/gp/mpc/A3G56UF402OH5G">106SIMPDRPCT</a> - $106 off Simpli Home mid century sofa table. Available now through 10/26, while supplies last.<br><a href="https://www.amazon.com/gp/mpc/A2WOLZHXB2TD8K">107SIMPBRLCO</a> - $107 off Simpli Home coffee table, espresso. Available now through 10/27, while supplies last.<br><a href="https://www.amazon.com/gp/mpc/A31K9ES9FUS26Y">107SIMPGALCC</a> - $107 off Simpli Home club chair, brown. Available now through 10/28, while supplies last.<br><a href="https://www.amazon.com/gp/mpc/A36Z44OW0LKZSN">108SIMPSHLA</a> - $108 off Simpli Home sawhorse ladder shelf bookcase. Available now through 10/27, while supplies last.<br><a href="https://www.amazon.com/gp/mpc/AEI9YGAF18G0G">111REDMOND</a> - $111 off Simpli Home coffee table, brown. Available now through 10/22, while supplies last.<br><a href="https://www.amazon.com/gp/mpc/ASPQGTKL9OMNZ">111SIMPSHLA1</a> - $111 off Simpli Home sawhorse ladder shelf bookcase, grey. Available now through 10/27, while supplies last.<br><a href="https://www.amazon.com/gp/mpc/ASZR7XRN69WRF">112SIMPBRLCT</a> - $112 off Simpli Home sofa table, espresso. Available now through 10/26, while supplies last.<br><a href="https://www.amazon.com/gp/mpc/A17ZLG6IXX82VA">115SIMPRIOCT</a> - $115 off Simpli Home sofa table, brown. Available now through 10/22, while supplies last.<br><a href="https://www.amazon.com/gp/mpc/A3UNLXJICFGHA7">119SIMPWSHWR</a> - $119 off Simpli Home storage wine rack, grey. Available now through 10/27, while supplies last.<br><a href="https://www.amazon.com/gp/mpc/AWZIPX8PX84CK">121SIMPDRPCT</a> - $121 off Simpli Home mid century coffee table, brown. Available now through 10/26, while supplies last.<br><a href="https://www.amazon.com/gp/mpc/A6YF9RREU7DVZ">126SIMPRIV</a> - $126 off Simpli Home coffee table, natural. Available now through 10/22, while supplies last.<br><a href="https://www.amazon.com/gp/mpc/AEVYKPEJ05W94">126SIMPCOSWR</a> - $126 off Simpli Home storage wine rack, brown. Available now through 10/26, while supplies last.<br><a href="https://www.amazon.com/gp/mpc/A3MSIL9OVVHC8T">127SIMPWSCON</a> - $127 off Simpli Home console sofa table, grey. Available now through 10/27, while supplies last.<br><a href="https://www.amazon.com/gp/mpc/A270DZ5R5L0LR4">128SIMPRIO1</a> - $128 off Simpli Home TV stand, brown. Available now through 10/22, while supplies last.<br><a href="https://www.amazon.com/gp/mpc/A2ODVO520H48LJ">128SIMPSH1</a> - $128 off Simpli Home media stand, chestnut. Available now through 10/27, while supplies last.<br><a href="https://www.amazon.com/gp/mpc/A2R6K02CLXB829">128SIMPSHTVS</a> - $128 off Simpli Home sawhorse media stand, grey. Available now through 10/27, while supplies last.<br><a href="https://www.amazon.com/gp/mpc/A26WARYE2RPSGW">129SIMPLI</a> - $129 off Simpli Home coffee table. Available now through 11/4, while supplies last. <br><a href="https://www.amazon.com/gp/mpc/A1N6WFCCUPC43N">130SIMCOFFEE</a> - $130 off Simpli Home coffee table, russet. Available now through 10/22, while supplies last.<br><a href="https://www.amazon.com/gp/mpc/A30IMXAGMDRI31">67SIMPHAMOT2</a> - $140 off Simpli Home storage ottoman, natural. Available now through 10/26, while supplies last.<br><a href="https://www.amazon.com/gp/mpc/AVJ7E2OH5WEQI">142SIMPDININ</a> - $142 off Simpli Home dining table, java. Available now through 10/27, while supplies last.<br><a href="https://www.amazon.com/gp/mpc/AMDKX3EAOR4GH">66SIMPCONET</a> - $146 off Simpli Home end table, dark brown. Available now through 10/26, while supplies last.<br><a href="https://www.amazon.com/gp/mpc/AI3UCFWYT64Z6">148SIMPMONCT</a> - $148 off Simpli Home console table, charcoal brown. Available now through 10/26, while supplies last.<br><a href="https://www.amazon.com/gp/mpc/A18XDDKVD2VKML">156SIMPARTVS</a> - $156 off Simpli Home tv stand, natural brown. Available now through 10/26, while supplies last.<br><a href="https://www.amazon.com/gp/mpc/A27K7333IBYQ8O">157SIMPSKY</a> - $157 off Simpli Home nesting coffee table. Available now through 10/22, while supplies last.<br><a href="https://www.amazon.com/gp/mpc/ACHWEOP8W2A4E">16BOOOKCASE</a> - $16 off 30H wooden bookcase. Available now through 10/21, while supplies last.<br><a href="https://www.amazon.com/gp/mpc/A1H61DTE8TK61P">186SIMPARTDR</a> - $186 off Simpli Home bedroom dresser, brown. Available now through 10/27, while supplies last.<br><a href="https://www.amazon.com/gp/mpc/ASDERZQ4BMXQ0">188SIMPLIDRE</a> - $188 off Simpli Home bedroom dresser, brown. Available now through 10/22, while supplies last.<br><a href="https://www.amazon.com/gp/mpc/A1SA931T3TMHYL">72SIMPSHTVS2</a> - $190 off Simpli Home TV media stand. Available now through 10/27, while supplies last.<br><a href="https://www.amazon.com/gp/mpc/AD4IYBIANSTZY">20LIGHTING</a> - $20 off Catalina 3-piece lamp set. Available now through 10/21, while supplies last.<br><a href="https://www.amazon.com/gp/mpc/A2HXIHX9C7ERDR">25SIMBAR</a> - $25 off Simpli Home bar stool, mocha. Available now through 10/23, while supplies last.<br><a href="https://www.amazon.com/gp/mpc/A178OQFPDL4E37">25SIMDAX</a> - $25 off Simpli Home office chair, black. Available now through 10/23, while supplies last.<br><a href="https://www.amazon.com/gp/mpc/A1AVQ35XYI07H4">25SIMBAR1</a> - $25 off Simpli Home bar stool, black. Available now through 10/22, while supplies last.<br><a href="https://www.amazon.com/gp/mpc/A2WUJXGR6MX10D">32SIMPCOSMET</a> - $32 off Simpli Home end table, farmhouse brown. Available now through 10/26, while supplies last.<br><a href="https://www.amazon.com/gp/mpc/A1P9KESLH4UFEN">35SIMPCARL1</a> - $35 off Simpli Home end table, brown. Available now through 10/22, while supplies last.<br><a href="https://www.amazon.com/gp/mpc/A15LNWU5L7EFVE">35SIMPCRLET</a> - $35 off Simpli Home end side table, brown. Available now through 10/26, while supplies last.<br><a href="https://www.amazon.com/gp/mpc/A3CL5SFBPTDPA5">35SIMPCRLEST</a> - $35 off Simpli Home end table, farmhouse grey. Available now through 10/26, while supplies last.<br><a href="https://www.amazon.com/gp/mpc/ALQSPBJFPYH70">53SIMPLISHCT</a> - $53 off Simpli Home sawhorse softa table, brown. Available now through 10/26, while supplies last.<br><a href="https://www.amazon.com/gp/mpc/A39DVEYSFR86QG">55SIMPSHCON</a> - $55 off Simpli Home sawhorse sofa table, chestnut. Available now through 10/27, while supplies last.<br><a href="https://www.amazon.com/gp/mpc/AYSW0239W76XL">55SIMEND</a> - $55 off Simpli Home side table, brown. Available now through 10/23, while supplies last.<br><a href="https://www.amazon.com/gp/mpc/A2FTJO8Z6DOMRF">57SIMPLARSB</a> - $57 off Simpli Home storage ottoman, dark brown. Available now through 10/26, while supplies last.<br><a href="https://www.amazon.com/gp/mpc/A29JB03L5M7VKA">57SIMPACADLS</a> - $57 off Simpli Home ladder bookcase. Available now through 10/26, while supplies last.<br><a href="https://www.amazon.com/gp/mpc/AWAQ74C0W4IXS">63SIMPDRAPND</a> - $63 off Simpli Home mid century end table, brown. Available now through 10/26, while supplies last.<br><a href="https://www.amazon.com/gp/mpc/AUS4YVGFOZK87">63SIMPCARLD</a> - $63 off Simpli Home office desk, dark brown. Available now through 10/26, while supplies last.<br><a href="https://www.amazon.com/gp/mpc/A2NC2BZX9BOOHB">64SIMPHAMOT</a> - $64 off Simpli Home storage ottoman, gray. Available now through 10/26, while supplies last.<br><a href="https://www.amazon.com/gp/mpc/A6P1MV47TPOQ1">71SIMPLIABWW</a> - $71 off Simpli Home entryway storage bench, light brown. Available now through 10/22, while supplies last.<br><a href="https://www.amazon.com/gp/mpc/A3IHH71MPXS9QN">72SIMPSHCT</a> - $72 off Simpli Home sawhorse coffee table, brown. Available now through 10/26, while supplies last.<br><a href="https://www.amazon.com/gp/mpc/AFK4QRBF2VV0M">72SIMPDYLCT</a> - $72 off Simpli Home coffee table, driftwood. Available now through 10/26, while supplies last.<br><a href="https://www.amazon.com/gp/mpc/A3H8BLK2FE4VK">74SIMPLIABW</a> - $74 off Simpli Home entryway storage bench, white. Available now through 10/22, while supplies last.<br><a href="https://www.amazon.com/gp/mpc/A1C71E1WXYQL3V">77SIMPJAMACC</a> - $77 off Simpli Home accent chair, bright blue. Available now through 10/28, while supplies last.<br><a href="https://www.amazon.com/gp/mpc/A3KEXZZNEJCT0U">77SIMPJENOTB</a> - $77 off Simpli Home ottoman bench, fawn. Available now through 10/29, while supplies last.<br><a href="https://www.amazon.com/gp/mpc/A2IV0MJAMIB9L0">78SIMPDYLSCT</a> - $78 off Simpli Home square coffee table, driftwood. Available now through 10/26, while supplies last.<br><a href="https://www.amazon.com/gp/mpc/A1FQB5O0LGND46">78SIMPCASTOT</a> - $78 off Simpli Home storage ottoman bench, tan. Available now through 10/28, while supplies last.<br><a href="https://www.amazon.com/gp/mpc/A3CPFSSY8I0JYR">80SIMPCASOTT</a> - $80 off Simpli Home storage ottoman bench, fawn. Available now through 10/28, while supplies last.<br><a href="https://www.amazon.com/gp/mpc/A2MKNYWRKOAPCQ">80SIMPDOROT2</a> - $80 off Simpli Home storage ottoman bench, black. Available now through 10/28, while supplies last.<br><a href="https://www.amazon.com/gp/mpc/AB1ZI4F4N7Y3U">81SIMPDRAPLS</a> - $81 off Simpli Home mid century low storage cabinet, brown. Available now through 10/26, while supplies last.<br><a href="https://www.amazon.com/gp/mpc/A2U42QJVU9CVTT">81SIMPJAMAC3</a> - $81 off Simpli Home accent chair, blue. Available now through 10/28, while supplies last.<br><a href="https://www.amazon.com/gp/mpc/A29BTAC6MYDGMM">81SIMPJAMAC4</a> - $81 off Simpli Home accent chair, brown. Available now through 10/28, while supplies last.<br><a href="https://www.amazon.com/gp/mpc/A1H538KJ9A1E4E">83SIMPLONGT2</a> - $81 off Simpli Home tub chair, grey. Available now through 10/28, while supplies last.<br><a href="https://www.amazon.com/gp/mpc/A149KQUU7ML949">81SIMPJAMAC2</a> - $81 off Simpli Home accent chair, taupe. Available now through 10/28, while supplies last.<br><a href="https://www.amazon.com/gp/mpc/A2AG676BNFXFZR">91SIMPKITLS</a> - $91 off Simpli Home low storage cabinet, dark brown. Available now through 10/26, while supplies last.<br><a href="https://www.amazon.com/gp/mpc/A1CFCFE67ZOMAI">98SIMPAVECO</a> - $98 off Simpli Home sofa table. Available now through 10/28, while supplies last.<br><a href="https://www.amazon.com/gp/mpc/A2KRS6J46JSLOG">98SIMPAVERC</a> - $98 off Simpli Home square coffee table, java. Available now through 10/28, while supplies last.<br><a href="https://www.amazon.com/gp/mpc/A21BCTSXP28ZH1">47SIMPBURLET</a> - $99 off Simpli Home end table, espresso. Available now through 10/26, while supplies last.   <u><em><br>Grocery:</em></u>  <br><a href="https://www.amazon.com/gp/mpc/A1UVLPTXBZ6FK0">20LKFEAST</a> - 20% off Lorissa\'s Kitchen snacks. Available now through 10/21/17.<br><a href="https://www.amazon.com/gp/mpc/A1TOATFNPLXAX8">15BRAZIL32CT</a> - 15%   off Peet\'s Coffee k-cup packs. Available now through 10/31, while supplies   last.    <br><u><em>Health &amp; Personal Care</em></u><em>:</em> <br><a href="https://www.amazon.com/gp/mpc/A3NOFTCEDX5J1J">30NATURALLY</a> - 30% off Naturally vitamins. Available now through 10/23/17, while supplies last.<br><a href="https://www.amazon.com/gp/mpc/AY0HAS2EW9S2V">30SGP</a> - 30% off Sleep Great supplement. Available now through 10/19/17, while supplies last.<br><a href="https://www.amazon.com/gp/mpc/A2UU17E77J5H5D">20YEAHBUDDY</a> - 20% off Ronnie Coleman pre-workout supplement. Available now through 10/19, while supplies last. <br><a href="https://www.amazon.com/gp/mpc/A3RTWO45OOT4BZ">20OUTLIFT4U</a> - 20%   off Nutrex pre-workout supplements. Available now through 10/21, while   supplies last.    <br><a href="https://www.amazon.com/gp/mpc/A1ZQEV944CZJY4">20NUTREXDIET</a> - 20%   off Nutrex supplements. Available now through 10/31, while supplies last.    <br><a href="https://www.amazon.com/gp/mpc/A1Z60L1IH2O2HR">20ZOLLISMILE</a> - 20%   off Zollipops anti-cavity products. Available now through 11/9, while   supplies last.    <br><a href="https://www.amazon.com/gp/mpc/A1MCOZM5FFKZVZ">20VENUS</a> - 20% off   Gillette Venus with Olay women\'s razors. Available now through 11/1, while   supplies last.   <br><a href="https://www.amazon.com/gp/mpc/AV1D48DA5EEZD">20GILLETTE</a> - 20%   off Gillette Fusion shave gel. Available now through 11/1, while supplies   last. <br><a href="https://www.amazon.com/gp/mpc/A1S5ASDTGDD58B">15HS4S</a> - 15% off   iHealth Lite wireless BMI scale. Available now through 11/10, while supplies   last.<br><a href="https://www.amazon.com/gp/mpc/AOPKI8SIQRR2I">15VENUS</a> - 15% off   Gillette Venus women\'s razor. Available now through 11/1, while supplies   last.<br><a href="https://www.amazon.com/gp/mpc/AHEECJPPEG2XO">1515HEALTHY</a> - 15%   off iHealth wireless blood pressure monitor. Available now through 11/1,   while supplies last.  <br><a href="https://www.amazon.com/gp/mpc/A37GNZ1UQ6WPXJ">15GILLETTE</a> - 15%   off Gillette Mach3 men\'s razor. Available now through 11/1, while supplies   last.<br><a href="https://www.amazon.com/gp/mpc/A1AXHLNN2FPS0C">5OFFGILLETTE</a> - $5   off Gillette Fusion ProGlide men\'s razer. Available now through 11/1, while   supplies last.<br><a href="https://www.amazon.com/gp/mpc/AXS45LAIT7XQX">15SBQ4PK</a> - 15% off Sea-Band anti-nausea kit. Available now through 10/30/17, while supplies last. <br><a href="https://www.amazon.com/gp/mpc/A3494P2OETBTQY">15LOVEBEETS</a> - 15% off superfood dietary supplement. Available now through 10/31, while supplies last.    <br><u><em>Home Improvement:</em></u><br><a href="https://www.amazon.com/gp/mpc/A1SAJDNZQK0LC">20LUNA1011</a> - 20% off towel sets. Available now through 11/2, while supplies last.    <br><a href="https://www.amazon.com/gp/mpc/A1KAETI5AJR0EE">15FALL2017</a> - 15% off EcoPure water filtration systems. Available now through 10/19, while   supplies last.    <br><a href="https://www.amazon.com/gp/mpc/A273HGBP91IIYN">6COUPONOFF</a> - $6 off Pass &amp; Seymour timer. Available now through 10/30, while supplies last.    <br><a href="https://www.amazon.com/gp/mpc/A2WWWUBO3TN0NH">3COUPONOFF</a> - $3 off Pass &amp; Seymour outlet. Available now through 10/30, while supplies last.    <br><u><em>Jewelry</em></u>: <a href="https://www.amazon.com/gp/mpc/A123WQR9UY0X9R">20JEWELRY</a> - 20% off Amazon Collection wedding bands. Available now through 10/23/17, while supplies last.<br><u><em>Kitchen:</em></u> <a href="https://www.amazon.com/gp/mpc/A227RSBTU7DKFX">30TIGEROCT</a> - $30 off Tiger JAX rice cooker. Available now through 10/31, while supplies last.    <br><u><em>Lawn &amp; Garden</em></u>:<a href="https://www.amazon.com/gp/mpc/A2JUDNVXYAI4LQ">15WORX15</a> - 15% off   WORX wheelbarrow &amp; leaf mulcher. Available now through 10/25, while   supplies last. <br><u><em>Outdoors</em></u>: <br><a href="https://www.amazon.com/gp/mpc/A1R537YSONWG8S">30Y4BK6Q109</a> - 30% off Yes4All Beach Blanket. Available now through 10/23/17, while supplies last.<br><a href="https://www.amazon.com/gp/mpc/A1UMNZDF431WSY">20PALERMO</a> - 20% off oversized beach towel. Available now through 10/22, while supplies last.    <br><a href="https://www.amazon.com/gp/mpc/A3JGANB0EAZAKN">15JETS</a> - 15% off insulated cooler bag. Available now through 10/31, while supplies last.    <br><a href="https://www.amazon.com/gp/mpc/A3K9RMZMXO35VN">15Y4AHM0510</a> - 15%   off Yes4All camping hammock. Available now through 11/3, while supplies last.        <br><u><em>Pets:</em></u><em> <br></em><a href="https://www.amazon.com/gp/mpc/A3IX98IG4YCP4">20GPN</a> - 20% off   Global Pet Nutrition soft chews. Available now through 10/31, while supplies   last.    <br><a href="https://www.amazon.com/gp/mpc/ACIC0SIKH7K6X">20PETCHEER</a> - 20%   off PetCheer cat scratcher lounge bed with catnip. Available now through   11/13, while supplies last.   <br><a href="https://www.amazon.com/gp/mpc/A1SBX5FOP4C0L0">20PETCHEER59</a> - 20%   off PetCheer cat scratcher lounge bed. Available now through 11/13, while   supplies last.    <em><br></em><a href="https://www.amazon.com/gp/mpc/A3NQELV0BQIMEM">104DB</a> - $10 off Best Pet Supplies pet bed. Available now through 10/22, while supplies last.<br><u><em>Sports:</em></u> <br><a href="https://www.amazon.com/gp/mpc/A3GAXVET7GZP0">35VB800PROMO</a> - 35% off Versus Sports volleyball set. Available now through 10/20/17, while supplies last.<br><a href="https://www.amazon.com/gp/mpc/A390HRHJP04IFJ">20BPYOGAMAT</a> - 20%   off BestsharedPlus yoga mat. Available now through 11/13, while supplies   last.    <br><a href="https://www.amazon.com/gp/mpc/A1QBHYYRPBLK2A">20DRONE</a> - 20% off   Callaway golf caddy push cart. Available now through 11/4, while supplies   last.    <br><u><em>Toys:</em></u> <a href="https://www.amazon.com/gp/mpc/A1VR45B463IXNR">20GIVEGREEN</a> - 20% off Green Toys. Available now through 10/22, while supplies last.<br><u><em>Tools &amp; Industrial Supplies</em></u>:<br><a href="https://www.amazon.com/gp/mpc/A3FI5W1U8PJLSV">25CORDOVA</a> - 25% off   Stanley protective work gloves. Available now through 11/10, while supplies   last.<br><a href="https://www.amazon.com/gp/mpc/A1WWO1DU68SYEE">20CORDOVA</a> - 20% off   Stanley synthetic leather gloves. Available now through 11/10, while supplies   last.    <br><a href="https://www.amazon.com/gp/mpc/A2EBFLN4MD3BS9">18PROMO</a> - 18% off   Meyer Gage gage sets. Available now through 10/31, while supplies last.  <br><a href="https://www.amazon.com/gp/mpc/A13KVL6YNJG635">15CORDOVA</a> - 15% off   Stanley work gloves. Available now through 11/10, while supplies last. </div></div>';

var goldBoxDealsURL = 'https://rssfeeds.s3.amazonaws.com/goldbox';

/**
*
* Http Server
*
*/

app.set('port', (process.env.PORT || 5000));

// // views is directory for all template files
// // app.set('views', __dirname + '/views');
// // app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  Response = response;

  // Start process
  // parseHTML();
  // response.render('pages/index')
  // response.send( 'Running' );
});

app.get('/gbd', function(req, res) {
  // Response = response;

  // Start process
  // parseHTML();
  // response.render('pages/index')
  // response.send( 'Running' );

  res.writeHead(200, {'Content-Type': 'text/html'}); 

  // res.write('<script>window.twttr = (function(d, s, id) {');
  // res.write('var js, fjs = d.getElementsByTagName(s)[0],');
  // res.write('  t = window.twttr || {};');
  // res.write('if (d.getElementById(id)) return t;');
  // res.write('js = d.createElement(s);');
  // res.write('js.id = id;');
  // res.write('js.src = "https://platform.twitter.com/widgets.js";');
  // res.write('fjs.parentNode.insertBefore(js, fjs);');
  // res.write('');
  // res.write('t._e = [];');
  // res.write('t.ready = function(f) {');
  // res.write('  t._e.push(f);');
  // res.write('};');
  // res.write('');
  // res.write('return t;');
  // res.write('}(document, "script", "twitter-wjs"));</script>');

  //res.write('Starting...');
  loadGoldBoxDeals();

  function loadGoldBoxDeals(){

	cache.getCache(goldBoxDealsURL, function(err,data){
        if(err || data == undefined ){
        	// cache MISS
        	console.log('cache MISS')
        	//res.write('cache MISS');
        	request(goldBoxDealsURL, function(error, response, data){

        		// console.log(data);

				// First we'll check to make sure no errors occurred when making the request
		        if(!error){		       
					cache.setCache(goldBoxDealsURL,data, function(){
						processGoldBoxDeals(data);
					});
		        }
		    });     
        
        }else{
        	// cache HIT
        	console.log('cache HIT');
        	//res.write('cache HIT');
        	processGoldBoxDeals(data);	
        }
    });

} // loadGoldBoxDeals

function processGoldBoxDeals(html){

	var $ = cheerio.load(html, { xmlMode: true });

	$('item').eq( getRandomRange( 0, $('item').length ) ).filter(function(){
        // var data = $(this);
        
        longURL = $( 'link', this ).text().replace( 'rssfeeds-20', process.env.amazon_tracking_id );
        title = $( 'title', this ).text();
        description = $( 'description', this ).text();

       // console.log(title);
       // console.log(description);

        $ = cheerio.load(description);
		
		$('img').filter(function(){
                var data = $(this);                
                amazonImg = data[0].attribs.src.replace('._SL160_','');
     
            });

        var bitly = new Bitly( process.env.bitly_access_token );

		bitly.shorten(longURL)
		.then(function(response) {
			// Do something with data 
			shortURL = response.data.url;

			// console.log(shortURL);
	
	        tweetGoldBoxDeals();

		}, function(error) {
			throw error;
		});

    });

} // processGoldBoxDeals

function tweetGoldBoxDeals(){

var T = new Twit( {
      consumer_key: process.env.twitter_consumer_key,
      consumer_secret: process.env.twitter_consumer_secret,
      access_token: process.env.twitter_access_token,
      access_token_secret: process.env.twitter_access_token_secret
    } );

    if( amazonImg != '' ){

    	// Process Media

	    // open a file called "lenna.png" 
		Jimp.read(amazonImg).then(function (image) {
		    // do stuff with the image 

		    Jimp.read('./src/public/assets/img/twitter-circle.png').then(function (src) {
		
		    Jimp.loadFont(Jimp.FONT_SANS_32_BLACK, function (err, fontBlack) {

		    	Jimp.loadFont(Jimp.FONT_SANS_32_WHITE, function (err, fontWhite){

		    		image.composite( src, 8, ( image.bitmap.height - 40 ) )
			    	.print(fontWhite, 50, ( image.bitmap.height - 42 ), "@"+process.env.twitter_handle )
			    	.print(fontBlack, 48, ( image.bitmap.height - 44 ), "@"+process.env.twitter_handle )
			    	.write('./src/public/assets/img/image.processed.jpg', function(){

			    			b64content = fs.readFileSync('./src/public/assets/img/image.processed.jpg', { encoding: 'base64' });

			    			// console.log(b64content);

			    			tweetWithMedia();	

			    			// res.write('Skipping Tweet');
			    			// res.end();

				    	}); // end write callback

			    	}); // end white font callback 

		    	});	// end blackfont font callback	    	

		    });	// end src image read

		}).catch(function (err) {
		    // handle an exception 
		    console.log(err);

		});

    }
    
    function tweetWithMedia(){

		// 
		// post a tweet with media 
		// 	
		 
		// first we must post the media to Twitter 
		T.post('media/upload', { media_data: b64content }, function (err, data, response) {
		  // now we can assign alt text to the media, for use by screen readers and 
		  // other text-based presentations and interpreters 
		  var mediaIdStr = data.media_id_string
		  var meta_params = { media_id: mediaIdStr, alt_text: { text: title } }
		 
		  T.post('media/metadata/create', meta_params, function (err, data, response) {
		    if (!err) {
		      
		      // now we can reference the media and post a tweet (media will attach to the tweet) 
		      // this is the tweet message
		      var tweet = { status: statusUpdate( title, '', shortURL ), media_ids: [mediaIdStr] } 
		 
		      // console.log(tweet);

		      T.post('statuses/update', tweet, tweeted);

		    }else{
		    	console.log(err);
		    	// error with media create
		    	console.log('error creating meta data');
		    }
		  });

		}); // save

	} // end tweetWithMedia


	function tweeted(err, data, response) {

	    if(err){

	      console.log("Something went wrong!");

	      console.log(err.message);
	   
	    }else{

	      // res.write('Voila It worked!');

	      T.get('statuses/oembed', { "id": data.id_str },  function (err, data, response) {
            
            res.write(data.html);

            res.end();
         });


	      

	    }

	} // end tweeted


} // end tweetGoldBoxDeals	

}); // end get /gdb

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


// loadGoldBoxDeals();


/**
*
* Functions
*
*/

function parseHTML(){

  var handler = new htmlparser.DefaultHandler(function (error, dom) {}, { verbose: false, ignoreWhitespace: true });
  var parser = new htmlparser.Parser(handler);
  parser.parseComplete( rawHtml );
  
  var dom = handler.dom;

  var children = dom[0].children[0].children;

  var promos = [];

  for (var child in children ) {

      // console.log(children);

      if( children[child].type != undefined && children[child].type == 'tag' && children[child].name == 'u'  ){

        // console.log(children[child].children[0].children[0]);

        if( children[child].children[0].children[0].data != undefined ){
            // console.log(children[child].children[0].children[0].data);
            category = children[child].children[0].children[0].data;
        }


      }else if( children[child].type != undefined && children[child].type == 'tag' && children[child].name == 'a'  ){

        // console.log(children[child].children[0].data);

        amazonURL = children[child].attribs.href;

        coupon = children[child].children[0].data;

        // if( children[child].children[0].children[0].data != undefined ){
        //     console.log(children[child]);
        //     // category = children[child].children[0].children[0].data;
        // }


      }else if( children[child].data != undefined ){

        // console.log(children[child]);
        var promo = new Object();

        promo.category = category;
        promo.label = children[child].data;
        promo.amazonURL = amazonURL;
        promo.coupon = coupon;
        promo.category = category;
        promo.description = promo.coupon + promo.label;
        promos.push(promo);

      }
    
  } 

   // console.log(shuffle(promos)[0]);         

   promo = shuffle(promos)[0];

   description = promo.description;
   category = promo.category.replace(/&amp;/g, '&');
   amazonURL = promo.amazonURL;
   longURL = amazonURL + '/?tag=' + process.env.amazon_tracking_id;

   verify();
}

function verify(){

  var query = "SELECT * FROM promotions WHERE `longURL` = '"+longURL+"'";

  // console.log(query);

  var db = new sqlite3.Database('./src/data/database.db');

  db.get(query, function(err, row) {
      
      if (err){
        console.log(err);   
        return;     
      }

      if( row != undefined  && row.tweet_status == 'OK' ){
        console.log('Skipping Entry, already complete');
        // console.log(row);
        Response.write('Skipping Entry, already complete');
        Response.end();
        return;
      }else if( row != undefined  && row.shortURL == '' ){
        console.log('Skipping Entry, trying shorten again');
        // console.log(row);
        Response.write('Skipping Entry, trying shorten again');
        // try tweeting again
        shortenURL();
      }else if( row != undefined  && row.tweet_status != 'OK' ){
        console.log('Skipping Entry, trying tweet again');
        // console.log(row);
        Response.write('Skipping Entry, trying tweet again');
        // try tweeting again
        shortURL = row.shortURL;
        loadImage();        
      }else{
        console.log('Inserting Entry');
        // console.log(row);
        Response.write('Inserting Entry');
        insert();
      }

  });
  
}


function insert(){

  var db = new sqlite3.Database('./src/data/database.db');

  db.serialize(function() {

    var stmt = db.prepare("INSERT INTO `promotions`(`ID`,`category`,`description`,`amazonURL`,`longURL`,`shortURL`,`date_created`) VALUES (NULL,(?),(?),(?),(?),(?), datetime('now') );");
    
    stmt.run(category ,description, amazonURL, longURL, shortURL );
    
    stmt.finalize();

  });

  db.close();

  shortenURL();
  
}

function shortenURL(){

  var bitly = new Bitly( process.env.bitly_access_token );

  bitly.shorten(longURL)
  .then(function(response) {
    // Do something with data 
    shortURL = response.data.url;

    var db = new sqlite3.Database('./src/data/database.db');
    
    db.serialize(function() {
  
      // UPDATE `promotions` SET `shortURL`=? WHERE `_rowid_`='7';
      var stmt = db.prepare("UPDATE `promotions` SET `shortURL`=(?), `date_updated` = datetime('now') WHERE `longURL`= (?);");
      
      stmt.run( shortURL, longURL );
      
      stmt.finalize();

    });

    db.close();

    tweet();

  }, function(error) {
    throw error;
  });

}

function tweet(){

    var T = new Twit( {
      consumer_key: process.env.twitter_consumer_key,
      consumer_secret: process.env.twitter_consumer_secret,
      access_token: process.env.twitter_access_token,
      access_token_secret: process.env.twitter_access_token_secret
    } );

    if( amazonImg != '' ){

    	// Process Media

	    // open a file called "lenna.png" 
		Jimp.read(amazonImg).then(function (image) {
		    // do stuff with the image 

		    Jimp.read('./src/public/assets/img/twitter-circle.png').then(function (src) {
		
		    Jimp.loadFont(Jimp.FONT_SANS_32_BLACK).then(function (font) {
		    
		    	image.composite( src, 8, ( image.bitmap.height - 40 ) )
		    		.print(font, 48, ( image.bitmap.height - 44 ), "@"+process.env.twitter_handle )
		    		.write('./src/public/assets/img/image.processed.jpg', function(){

	    				// 
						// post a tweet with media 
						// 
						var b64content = fs.readFileSync('./src/public/assets/img/image.processed.jpg', { encoding: 'base64' })

						// console.log(b64content);
						 
						// first we must post the media to Twitter 
						T.post('media/upload', { media_data: b64content }, function (err, data, response) {
						  // now we can assign alt text to the media, for use by screen readers and 
						  // other text-based presentations and interpreters 
						  var mediaIdStr = data.media_id_string
						  var meta_params = { media_id: mediaIdStr, alt_text: { text: description } }
						 
						  T.post('media/metadata/create', meta_params, function (err, data, response) {
						    if (!err) {
						      
						      // now we can reference the media and post a tweet (media will attach to the tweet) 
						      // this is the tweet message
						      var tweet = { status: statusUpdate( category, description, shortURL ), media_ids: [mediaIdStr] } 
						 
						      T.post('statuses/update', tweet, tweeted);

						    }else{
						    	// error with media create
						    	console.log('error creating meta data');
						    }
						  });

	    				}); // save
		    	
				});

		    });

		    }).catch(function (err) {
			    // handle an exception 

			});

		}).catch(function (err) {
		    // handle an exception 

		    // 
			// post a tweet without media 
			// 
			// var tweet = { status: statusUpdate( category, description, shortURL ) } // this is the tweet message
		 	// console.log(tweet);
			// Response.write( JSON.stringify(tweet) );
		    // T.post('statuses/update', tweet, tweeted) // this is how we actually post a tweet ,again takes three params 'statuses/update' , tweet message and a call back function

		});

    }
    
	// end with no tweet is sent
	Response.end();

    function tweeted(err, data, response) {

    if(err){

      console.log("Something went wrong!");

      console.log(err.message);

      var db = new sqlite3.Database('./src/data/database.db');

      db.serialize(function() {
    
        // UPDATE `promotions` SET `shortURL`=? WHERE `_rowid_`='7';
        var stmt = db.prepare("UPDATE `promotions` SET `tweet_status`=(?), `date_updated` = datetime('now') WHERE `longURL`= (?);");
        
        stmt.run( err.message, longURL );
        
        stmt.finalize();

      });

      db.close();

    }else{

      console.log("Voila It worked!");

      console.log(response.statusMessage);

      var db = new sqlite3.Database('./src/data/database.db');

      db.serialize(function() {
    
        // UPDATE `promotions` SET `shortURL`=? WHERE `_rowid_`='7';
        var stmt = db.prepare("UPDATE `promotions` SET `tweet_status`=(?), `date_updated` = datetime('now') WHERE `longURL`= (?);");
        
        stmt.run( response.statusMessage, longURL );
        
        stmt.finalize();

      });

      db.close();

    }

    // Response.end();

    } // this is the call back function which does something if the post was successful or unsuccessful.

} // end tweet

function loadImage(){

	// https://www.amazon.com/gp/mpc/A13KVL6YNJG635

    // The structure of our request call
    // The first parameter is our URL
    // The callback function takes 3 parameters, an error, response status code and the html

    request(amazonURL, function(error, response, html){

        // First we'll check to make sure no errors occurred when making the request

        if(!error){
            // Next, we'll utilize the cheerio library on the returned html which will essentially give us jQuery functionality

            var $ = cheerio.load(html);

            // Finally, we'll define the variables we're going to capture

            // console.log(json);

            $('td.product-list-table-col img').filter(function(){
                var data = $(this);
                
                amazonImg = data[0].attribs.src.replace('._SL160_','');

                console.log(amazonImg);
                
            });

            tweet();
        }
    });

}

function statusUpdate( category, description, shortURL ){

  var statusUpdate = '';

  var optionalTag = (getRandomRange(0,tags.length) > 5)?' '+ tags[getRandomRange(0,tags.length)] +' ':' ';

  var maxLength = 139 - ( category.length + 2 + shortURL.length + optionalTag.length );

  statusUpdate = category + ': ' + trimWords(description, maxLength) + optionalTag + shortURL;

  return statusUpdate;
}

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function getRandomRange(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

function trimWords(description, maxLength){
	description = description.replace(/\s\s+/g, ' ')

	description = description.substring(0, maxLength);

	var length = maxLength;
	// console.log(length);
	for (var i = maxLength - 1; i >= 0; i--) {
		if(description[i] == ' '){
			length = i;
			break;
		}	
	};
	// console.log(length);

	return description.substring(0, length);
}